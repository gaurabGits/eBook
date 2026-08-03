const express = require("express");
const { searchBooks, getBookDetails } = require("../controllers/openLibraryController");

const router = express.Router();

router.get("/search", searchBooks);
router.get("/works/:id", getBookDetails);

module.exports = router;
