const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminMiddleware");
const {
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
} = require("../controllers/adminControllers");
const {
  createAdminNotification,
  getAdminSentNotifications,
} = require("../controllers/notificationControllers");

router.post("/login", loginAdmin);
router.get("/dashboard", adminAuth, getDashboardStats);

// Notifications (send to users)
router.post("/notifications", adminAuth, createAdminNotification);
router.get("/notifications/sent", adminAuth, getAdminSentNotifications);

// User management
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);
router.put("/users/:id/block", adminAuth, toggleBlockUser);

// Book management
router.get("/books", adminAuth, getAllBooks);
router.post("/books", adminAuth, addBook);
router.get("/books/deletion-history", adminAuth, getBookDeletionHistory);
router.delete("/books/bulk-delete", adminAuth, deleteAllBooks);
router.put("/books/:id", adminAuth, editBook);
router.delete("/books/:id", adminAuth, deleteBook);

// Review management
router.get("/reviews", adminAuth, getAllReviews);
router.delete("/reviews/:id", adminAuth, deleteReview);


module.exports = router;
