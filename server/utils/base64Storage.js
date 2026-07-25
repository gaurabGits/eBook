const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Book = require("../models/book");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Saves a base64 string (image or pdf) to server/uploads/ disk folder
 * and returns the relative URL string, e.g. "/uploads/cover-1721740000-a1b2c3d4.png"
 */
const saveBase64ToFile = async (base64Str, prefix = "file") => {
  if (typeof base64Str !== "string" || !base64Str.startsWith("data:")) {
    return base64Str;
  }

  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) return base64Str;

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];

  let ext = "bin";
  if (mimeType.includes("pdf")) ext = "pdf";
  else if (mimeType.includes("png")) ext = "png";
  else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
  else if (mimeType.includes("webp")) ext = "webp";
  else if (mimeType.includes("gif")) ext = "gif";
  else if (mimeType.includes("svg")) ext = "svg";

  const randomHash = crypto.randomBytes(6).toString("hex");
  const filename = `${prefix}-${Date.now()}-${randomHash}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  const buffer = Buffer.from(base64Data, "base64");
  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/${filename}`;
};

/**
 * Migrates existing MongoDB book records that have raw base64 data in coverImage or pdfUrl
 * into lightweight static files in /uploads/ folder.
 */
const migrateBase64BooksInDB = async () => {
  try {
    const booksWithBase64 = await Book.find({
      $or: [
        { coverImage: { $regex: "^data:" } },
        { pdfUrl: { $regex: "^data:" } },
      ],
    }).select("_id coverImage pdfUrl");

    if (!booksWithBase64 || booksWithBase64.length === 0) {
      return;
    }

    console.log(`Converting ${booksWithBase64.length} base64 DB book documents to disk files...`);

    for (const book of booksWithBase64) {
      const updates = {};
      if (book.coverImage && book.coverImage.startsWith("data:")) {
        updates.coverImage = await saveBase64ToFile(book.coverImage, "cover");
      }
      if (book.pdfUrl && book.pdfUrl.startsWith("data:")) {
        updates.pdfUrl = await saveBase64ToFile(book.pdfUrl, "pdf");
      }

      if (Object.keys(updates).length > 0) {
        await Book.updateOne({ _id: book._id }, { $set: updates });
      }
    }

    console.log("Successfully converted base64 books in database to static disk files!");
  } catch (error) {
    console.error("Error migrating base64 books:", error.message);
  }
};

module.exports = {
  saveBase64ToFile,
  migrateBase64BooksInDB,
};
