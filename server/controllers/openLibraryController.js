const axios = require("axios");

// Search books
const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`
    );

    const books = response.data.docs.map((book) => ({
        id: book.key,
        title: book.title,
        author: book.author_name ? book.author_name[0] : "Unknown Author",
        coverImage: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null,
        publishYear: book.first_publish_year || "Unknown Year",
        subjects: book.subjects?.slice(0, 5) || [], // Limit to first 5 subjects
        source: "openLibrary",
    }));

    res.status(200).json({
      success: true,
      books: books
    });
  } catch (error) {
    console.error("Open Library Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
    });
  }
};

module.exports = { searchBooks };
