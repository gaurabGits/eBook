const express = require('express');
const { addBook, getAllBooks, getBookById, readBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");


const router = express.Router();


// router.post("/", protect, addBook);
// router.post("/", protect, getAllBooks);

// Only admins can add a book
router.post("/", protect, adminOnly, 
    upload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), 
    addBook
);

router.get("/", protect, getAllBooks);
router.get("/:id", getBookById);
router.get("/:id/read", protect, readBook)

module.exports = router;