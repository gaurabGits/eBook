const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isbn: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      trim: true,
      default: "",
    },
    pageCount: {
      type: Number,
      default: null,
    },
    publicationDate: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    reads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookSchema.index({ createdAt: -1 });
bookSchema.index({ reads: -1, createdAt: -1 });
bookSchema.index({ category: 1, createdAt: -1 });
bookSchema.index({ isPaid: 1, createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
