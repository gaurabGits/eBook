const Book = require("../models/book");
const Bookmark = require("../models/bookmark");
const Bookshelf = require("../models/bookshelf");
const BookActivity = require("../models/bookActivity");
const path = require("path");
const fs = require("fs");
const { computeContentBasedSimilarity } = require("../utils/recommendations/contentBased");
const { getCollaborativeScores } = require("../utils/recommendations/collaborativeFiltering");
const { saveBase64ToFile } = require("../utils/base64Storage");

const BOOK_LIST_SELECT = "title author description category coverImage averageRating totalRatings reads createdAt updatedAt";

const markActivityOnce = async ({ userId, bookId, field }) => {
  if (!userId) return false;
  const now = new Date();

  try {
    const res = await BookActivity.updateOne(
      { user: userId, book: bookId, [field]: null },
      { $set: { [field]: now } },
      { upsert: true }
    );

    return (res?.modifiedCount ?? 0) > 0 || (res?.upsertedCount ?? 0) > 0;
  } catch (err) {
    if (err?.code === 11000) return false;
    throw err;
  }
};

const attachUserBookFlags = async (books, userId) => {
  const normalized = books.map((book) => (typeof book.toObject === "function" ? book.toObject() : book));

  if (!userId || normalized.length === 0) {
    return normalized.map((book) => ({
      ...book,
      isBookmarked: Boolean(book.isBookmarked),
      shelfStatus: book.shelfStatus ?? null,
      totalReadSeconds: book.totalReadSeconds ?? 0,
      lastReadPage: book.lastReadPage ?? 1,
      lastReadAt: book.lastReadAt ?? null,
    }));
  }

  const bookIds = normalized.map((book) => book._id);
  const [bookmarks, shelfEntries] = await Promise.all([
    Bookmark.find({
      user: userId,
      book: { $in: bookIds },
    }).select("book"),
    Bookshelf.find({
      user: userId,
      book: { $in: bookIds },
    }).select("book status totalReadSeconds lastReadPage lastReadAt"),
  ]);

  const bookmarkedIds = new Set(bookmarks.map((item) => String(item.book)));
  const shelfDataByBookId = new Map(
    shelfEntries.map((item) => [
      String(item.book),
      {
        status: item.status,
        totalReadSeconds: item.totalReadSeconds ?? 0,
        lastReadPage: item.lastReadPage ?? 1,
        lastReadAt: item.lastReadAt ?? null,
      },
    ])
  );

  return normalized.map((book) => ({
    ...book,
    isBookmarked: bookmarkedIds.has(String(book._id)),
    shelfStatus: shelfDataByBookId.get(String(book._id))?.status ?? book.shelfStatus ?? null,
    totalReadSeconds: shelfDataByBookId.get(String(book._id))?.totalReadSeconds ?? book.totalReadSeconds ?? 0,
    lastReadPage: shelfDataByBookId.get(String(book._id))?.lastReadPage ?? book.lastReadPage ?? 1,
    lastReadAt: shelfDataByBookId.get(String(book._id))?.lastReadAt ?? book.lastReadAt ?? null,
  }));
};

// Add a new book
const addBook = async (req, res) => {
  try {
    const { title, author, description, category } = req.body;
    const pdfFile = req.files?.pdf?.[0];
    const coverFile = req.files?.coverImage?.[0];

    let pdfUrl = pdfFile
      ? `/uploads/${pdfFile.filename}`
      : req.body.pdfUrl;

    if (!pdfUrl) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    let coverImage = coverFile
      ? `/uploads/${coverFile.filename}`
      : req.body.coverImage || "";

    if (pdfUrl.startsWith("data:")) {
      pdfUrl = await saveBase64ToFile(pdfUrl, "pdf");
    }
    if (coverImage.startsWith("data:")) {
      coverImage = await saveBase64ToFile(coverImage, "cover");
    }


    const book = await Book.create({
      title,
      author,
      description,
      category,
      pdfUrl,
      coverImage,
    });

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Read book
const readBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const userId = req.user?.id ?? null;

    const didMarkRead = await markActivityOnce({ userId, bookId: book._id, field: "readAt" });
    if (didMarkRead) {
      await Book.updateOne({ _id: book._id }, { $inc: { reads: 1 } }, { timestamps: false });
    }

    const pdfUrl = book.pdfUrl || "";

    // Support base64 data URLs (admin uploads)
    if (pdfUrl.startsWith("data:")) {
      const match = pdfUrl.match(/^data:application\/pdf;base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({ message: "Invalid PDF data." });
      }
      const buffer = Buffer.from(match[1], "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", buffer.length);
      return res.send(buffer);
    }

    // If pdfUrl is a full URL, redirect
    if (/^https?:\/\//i.test(pdfUrl)) {
      return res.redirect(pdfUrl);
    }

    // Otherwise assume local uploads path
    const filePath = path.join(__dirname, "..", pdfUrl.replace(/^\//, ""));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get single book by id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    const userId = req.user?.id ?? null;

    await markActivityOnce({ userId, bookId: book._id, field: "viewedAt" });

    const canRead = true;

    let isBookmarked = false;
    let shelfStatus = null;
    let totalReadSeconds = 0;
    let lastReadPage = 1;
    let lastReadAt = null;

    if (userId) {
      const [bmDoc, shelfDoc] = await Promise.all([
        Bookmark.findOne({ user: userId, book: book._id }).select("_id"),
        Bookshelf.findOne({ user: userId, book: book._id }).select("status totalReadSeconds lastReadPage lastReadAt"),
      ]);
      isBookmarked = !!bmDoc;
      shelfStatus = shelfDoc?.status ?? null;
      totalReadSeconds = shelfDoc?.totalReadSeconds ?? 0;
      lastReadPage = shelfDoc?.lastReadPage ?? 1;
      lastReadAt = shelfDoc?.lastReadAt ?? null;
    }

    const access = { canRead };
    const bookObject = book.toObject();

    const normalizedBook = {
      ...bookObject,
      isBookmarked,
      shelfStatus,
      totalReadSeconds,
      lastReadPage,
      lastReadAt,
    };

    res.json({ book: normalizedBook, access });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const { search, category, type } = req.query;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const hasPagination = Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    const query = {};

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    if (type === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    const isUnfilteredQuery = Object.keys(query).length === 0;

    let booksQuery = Book.find(query)
      .select(BOOK_LIST_SELECT)
      .sort({ _id: -1 })
      .lean();

    if (hasPagination) {
      booksQuery = booksQuery.skip((page - 1) * limit).limit(limit);
    }

    const [total, books] = await Promise.all([
      isUnfilteredQuery
        ? Book.estimatedDocumentCount()
        : Book.countDocuments(query),
      booksQuery,
    ]);

    const booksWithBookmark = await attachUserBookFlags(books, req.user?.id);

    res.json({
      total,
      currentPage: hasPagination ? page : 1,
      totalPages: hasPagination ? Math.ceil(total / limit) : 1,
      books: booksWithBookmark,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

//get bookmarked books
const getBookmarkedBooks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("book", BOOK_LIST_SELECT);

    const books = bookmarks
      .filter((item) => item.book)
      .map((item) => ({
        ...item.book.toObject(),
        isBookmarked: true,
        bookmarkedAt: item.createdAt,
      }));

    const booksWithFlags = await attachUserBookFlags(books, req.user?.id);

    return res.json({
      total: booksWithFlags.length,
      books: booksWithFlags,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add bookmark
const addBookmark = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("_id");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await Bookmark.findOneAndUpdate(
      { user: req.user.id, book: req.params.id },
      { $setOnInsert: { user: req.user.id, book: req.params.id } },
      { upsert: true, new: true }
    );

    return res.json({
      message: "Bookmarked successfully",
      bookmarked: true,
      bookId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get popular books
const getPopularBooks = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : 3;

    const books = await Book.find({})
      .select(BOOK_LIST_SELECT)
      .sort({ reads: -1, createdAt: -1 })
      .allowDiskUse(true)
      .limit(limit)
      .lean();

    const booksWithBookmark = await attachUserBookFlags(books, req.user?.id);

    return res.json({
      total: booksWithBookmark.length,
      books: booksWithBookmark,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const recCache = new Map();
const REC_CACHE_TTL_MS = 2 * 60 * 1000;

function getCachedRec(key) {
  const cached = recCache.get(key);
  if (cached && Date.now() - cached.timestamp < REC_CACHE_TTL_MS) {
    return cached.data;
  }
  if (cached) recCache.delete(key);
  return null;
}

function setCachedRec(key, data) {
  if (recCache.size > 500) recCache.clear();
  recCache.set(key, { data, timestamp: Date.now() });
}

// Get book recommendations (content-based)
const getBookRecommendations = async (req, res) => {
  try {
    const bookId = req.params.id;
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : 10;
    const excludeBookId = String(req.query.excludeBookId || "").trim();

    const cacheKey = `content:${bookId}:${limit}:${excludeBookId}`;
    const cachedTop = getCachedRec(cacheKey);
    if (cachedTop) {
      const booksWithBookmarks = await attachUserBookFlags(cachedTop, req.user?.id);
      return res.json({
        algorithm: "content_based",
        total: booksWithBookmarks.length,
        books: booksWithBookmarks,
      });
    }

    const target = await Book.findById(bookId).lean();
    if (!target) {
      return res.status(404).json({ message: "Book not found" });
    }

    const candidates = new Map();
    const pushCandidates = (items) => {
      for (const item of items) {
        if (!item?._id) continue;
        const key = String(item._id);
        if (key === String(bookId)) continue;
        if (excludeBookId && key === excludeBookId) continue;
        if (!candidates.has(key)) candidates.set(key, item);
      }
    };

    const baseProjection = "title author description category coverImage averageRating totalRatings reads";

    const [sameCategory, sameAuthor, popularFallback] = await Promise.all([
      Book.find({ _id: { $ne: bookId }, category: target.category }).select(baseProjection).limit(30).lean(),
      Book.find({ _id: { $ne: bookId }, author: target.author }).select(baseProjection).limit(20).lean(),
      Book.find({ _id: { $ne: bookId } })
        .select(baseProjection)
        .sort({ reads: -1, createdAt: -1 })
        .limit(30)
        .lean(),
    ]);

    pushCandidates(sameCategory);
    pushCandidates(sameAuthor);
    if (candidates.size < 80) pushCandidates(popularFallback);

    const scored = [];
    for (const candidate of candidates.values()) {
      const sim = computeContentBasedSimilarity(target, candidate);
      const matchPercent = Math.max(0, Math.min(100, Math.round((Number(sim.score) || 0) * 100)));
      scored.push({
        ...candidate,
        recommendation: {
          algorithm: "content_based",
          score: sim.score,
          matchPercent,
          reasons: sim.reasons,
        },
      });
    }

    scored.sort((a, b) => {
      if (b.recommendation.score !== a.recommendation.score) return b.recommendation.score - a.recommendation.score;
      const br = Number.isFinite(b.reads) ? b.reads : 0;
      const ar = Number.isFinite(a.reads) ? a.reads : 0;
      return br - ar;
    });

    const top = scored.slice(0, limit);
    setCachedRec(cacheKey, top);

    const topWithBookmarks = await attachUserBookFlags(top, req.user?.id);

    return res.json({
      algorithm: "content_based",
      total: topWithBookmarks.length,
      books: topWithBookmarks,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBookCollaborativeRecommendations = async (req, res) => {
  try {
    const bookId = req.params.id;
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : 12;

    const cacheKey = `collab:${bookId}:${limit}`;
    const cachedTop = getCachedRec(cacheKey);
    if (cachedTop) {
      const booksWithBookmarks = await attachUserBookFlags(cachedTop, req.user?.id);
      return res.json({
        algorithm: "collaborative",
        total: booksWithBookmarks.length,
        books: booksWithBookmarks,
      });
    }

    const target = await Book.findById(bookId).select("_id").lean();
    if (!target) {
      return res.status(404).json({ message: "Book not found" });
    }

    const scores = await getCollaborativeScores(BookActivity, bookId, {
      maxUsers: 400,
      maxCandidates: 500,
    });

    const baseProjection = "title author description category coverImage averageRating totalRatings reads";

    let orderedBooks = [];
    if (scores.length > 0) {
      const top = scores.slice(0, limit * 3);
      const idOrder = top.map((x) => String(x._id));
      const scoreById = new Map(top.map((x) => [String(x._id), x]));

      const docs = await Book.find({ _id: { $in: idOrder } }).select(baseProjection).lean();
      const docById = new Map(docs.map((d) => [String(d._id), d]));
      orderedBooks = idOrder.map((id) => docById.get(id)).filter(Boolean);

      orderedBooks = orderedBooks.slice(0, limit).map((book) => {
        const stat = scoreById.get(String(book._id));
        const readers = Number.isFinite(stat?.readers) ? stat.readers : 0;
        const reasons = [];
        if (readers > 0) reasons.push("Readers also read");

        return {
          ...book,
          recommendation: {
            algorithm: "collaborative",
            score: Number.isFinite(stat?.score) ? stat.score : 0,
            reasons: reasons.length > 0 ? reasons : ["Readers also viewed"],
          },
        };
      });
    }

    setCachedRec(cacheKey, orderedBooks);

    const booksWithBookmarks = await attachUserBookFlags(orderedBooks, req.user?.id);

    return res.json({
      algorithm: "collaborative",
      total: booksWithBookmarks.length,
      books: booksWithBookmarks,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBook,
  getBookById,
  readBook,
  getAllBooks,
  getPopularBooks,
  getBookmarkedBooks,
  addBookmark,
  getBookRecommendations,
  getBookCollaborativeRecommendations,
};

