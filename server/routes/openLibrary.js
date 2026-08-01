const express = require("express");
const { searchBooks } = require("../controllers/openLibraryController")

const router = express.Router();

router.get("/search", searchBooks);


module.exports = router;