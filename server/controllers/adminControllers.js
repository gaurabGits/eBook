const Admin = require("../models/admin");
const mongoose = require("mongoose");
const User = require("../models/user");
const Book = require("../models/book");
const Review = require("../models/review");
const Bookmark = require("../models/bookmark");
const Bookshelf = require("../models/bookshelf");
const BookActivity = require("../models/bookActivity");
const AdminActivity = require("../models/adminActivity");
const jwt = require("jsonwebtoken");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const DELETE_ALL_BOOKS_CONFIRM_TEXT = "DELETE ALL BOOKS";


const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const parseLimit = (value, fallback = 10, max = 25) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), 1), max);
};

const deleteBookRelations = async (bookIds) => {
  if (!Array.isArray(bookIds) || bookIds.length === 0) return;

  await Promise.all([
    Bookmark.deleteMany({ book: { $in: bookIds } }),
    Bookshelf.deleteMany({ book: { $in: bookIds } }),
    BookActivity.deleteMany({ book: { $in: bookIds } }),
    Review.deleteMany({ book: { $in: bookIds } }),
  ]);
};

const loginAdmin = async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const defaultUsername = String(process.env.ADMIN_USERNAME || "admin").trim();
    const defaultPassword = String(process.env.ADMIN_PASSWORD || "admin");

    let admin = await Admin.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(username)}$`, "i") },
    });

    // If admin row does not exist yet, create it from .env defaults.
    if (!admin) {
      if (username.toLowerCase() === defaultUsername.toLowerCase() && password === defaultPassword) {
        admin = await Admin.create({
          username: defaultUsername,
          password: defaultPassword,
        });
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
      }
    }

    // Recover legacy plain-text admin password and re-hash it once.
    let isMatch = false;
    try {
      isMatch = await admin.matchPassword(password);
    } catch (_error) {
      if (typeof admin.password === "string" && admin.password === password) {
        admin.password = password;
        await admin.save();
        isMatch = true;
      }
    }

    if (!isMatch && username.toLowerCase() === defaultUsername.toLowerCase() && password === defaultPassword) {
      admin.password = defaultPassword;
      await admin.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    return res.json({
      _id: admin._id,
      username: admin.username,
      lastLoginAt: admin.lastLoginAt,
      token: generateToken(admin._id),
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDashboardStats = async (_req, res) => {
  try {
    const [totalUsers, totalBooks, blockedUsers, totalReviews, avgAgg] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      Review.countDocuments(),
      Review.aggregate([
        { $match: { rating: { $gte: 1, $lte: 5 } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    const avgRating = Number(avgAgg?.[0]?.avgRating) || 0;

    return res.json({
      totalUsers,
      totalBooks,
      blockedUsers,
      totalReviews,
      avgRating,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllBooks = async (_req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const { saveBase64ToFile } = require("../utils/base64Storage");

const addBook = async (req, res) => {
  try {
    const payload = { ...(req.body ?? {}) };

    if (payload.coverImage) {
      payload.coverImage = await saveBase64ToFile(payload.coverImage, "cover");
    }
    if (payload.pdfUrl) {
      payload.pdfUrl = await saveBase64ToFile(payload.pdfUrl, "pdf");
    }

    const book = new Book(payload);
    const savedBook = await book.save();
    return res.status(201).json(savedBook);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editBook = async (req, res) => {
  try {
    const existing = await Book.findById(req.params.id).select("_id");
    if (!existing) return res.status(404).json({ message: "Book not found" });

    const updates = { ...(req.body ?? {}) };

    if (updates.coverImage) {
      updates.coverImage = await saveBase64ToFile(updates.coverImage, "cover");
    }
    if (updates.pdfUrl) {
      updates.pdfUrl = await saveBase64ToFile(updates.pdfUrl, "pdf");
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.json(book);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("_id");
    if (!book) return res.status(404).json({ message: "Book not found" });
    await deleteBookRelations([book._id]);
    await Book.deleteOne({ _id: book._id });
    return res.json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAllBooks = async (req, res) => {
  try {
    const typedUsername = String(req.body?.typedUsername || "").trim();
    const confirmationText = String(req.body?.confirmationText || "").trim();

    if (!typedUsername || !confirmationText) {
      return res.status(400).json({ message: "Both confirmation inputs are required." });
    }

    if (typedUsername.toLowerCase() !== String(req.admin?.username || "").trim().toLowerCase()) {
      return res.status(400).json({ message: "Typed admin username does not match the logged-in admin." });
    }

    if (confirmationText !== DELETE_ALL_BOOKS_CONFIRM_TEXT) {
      return res.status(400).json({ message: `Type "${DELETE_ALL_BOOKS_CONFIRM_TEXT}" exactly to confirm.` });
    }

    const books = await Book.find().select("_id title").lean();
    if (books.length === 0) {
      return res.status(400).json({ message: "There are no books to delete." });
    }

    const bookIds = books.map((book) => book._id);
    await deleteBookRelations(bookIds);
    const result = await Book.deleteMany({ _id: { $in: bookIds } });
    const deletedCount = result.deletedCount ?? books.length;

    const activity = await AdminActivity.create({
      admin: req.admin._id,
      action: "bulk_delete_books",
      targetType: "book",
      level: "critical",
      title: "Deleted all books",
      message: `${req.admin.username} permanently removed all books from the platform library.`,
      metadata: {
        typedUsername,
        confirmationText,
        deletedCount,
        sampleTitles: books.slice(0, 5).map((book) => book.title).filter(Boolean),
      },
    });

    return res.json({
      message: `${deletedCount} book${deletedCount === 1 ? "" : "s"} deleted successfully.`,
      deletedCount,
      activityId: activity._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookDeletionHistory = async (_req, res) => {
  try {
    const limit = parseLimit(_req.query.limit, 8, 20);

    const rows = await AdminActivity.find({
      action: "bulk_delete_books",
      targetType: "book",
    })
      .populate("admin", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      history: rows.map((row) => ({
        id: String(row._id),
        title: row.title,
        message: row.message,
        level: row.level,
        action: row.action,
        targetType: row.targetType,
        createdAt: row.createdAt,
        adminUsername: row.admin?.username || "Admin",
        metadata: {
          typedUsername: row.metadata?.typedUsername || "",
          confirmationText: row.metadata?.confirmationText || "",
          deletedCount: Number(row.metadata?.deletedCount) || 0,
          sampleTitles: Array.isArray(row.metadata?.sampleTitles) ? row.metadata.sampleTitles : [],
        },
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllReviews = async (_req, res) => {
  try {
    const reviews = await Review.find()
      .populate("book", "title author coverImage")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  getAllBooks,
  addBook,
  editBook,
  deleteBook,
  deleteAllBooks,
  getBookDeletionHistory,
  getAllReviews,
  deleteReview
};
