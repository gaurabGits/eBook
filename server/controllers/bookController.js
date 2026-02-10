const Book = require("../models/Book");

// Add a new book
const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      pdfUrl,
      coverImage,
      isPaid,
      price,
    } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      category,
      pdfUrl,
      coverImage,
      isPaid,
      price,
    });

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get single book by id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if(!book){
      return res.status(404).json({message: "Book not found"})
    }
    res.json(book);
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
};

module.exports = { addBook, getAllBooks, getBookById };
