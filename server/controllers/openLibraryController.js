const axios = require("axios");

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 40;

const clampNumber = (value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const getWorkId = (key = "") => String(key).split("/").filter(Boolean).pop() || "";

const normalizeSearchBook = (book) => {
  const subjects = book.subject || book.subjects || [];
  const openLibraryId = getWorkId(book.key);

  return {
    id: openLibraryId,
    openLibraryId,
    key: book.key,
    title: book.title || "Untitled Book",
    author: book.author_name ? book.author_name.slice(0, 3).join(", ") : "Unknown Author",
    coverImage: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
    publishYear: book.first_publish_year || null,
    publicationDate: book.first_publish_year ? String(book.first_publish_year) : "",
    isbn: Array.isArray(book.isbn) ? book.isbn[0] || "" : "",
    language: Array.isArray(book.language) ? book.language[0] || "" : "",
    subjects: subjects.slice(0, 5),
    category: subjects[0] || "Open Library",
    description: book.first_sentence?.[0] || "Book data provided by Open Library.",
    source: "openLibrary",
    openLibraryUrl: `${OPEN_LIBRARY_BASE_URL}${book.key}`,
  };
};

const normalizeDescription = (description) => {
  if (!description) return "Book data provided by Open Library.";
  if (typeof description === "string") return description;
  if (typeof description.value === "string") return description.value;
  return "Book data provided by Open Library.";
};

const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const page = clampNumber(req.query.page, 1);
    const limit = clampNumber(req.query.limit, DEFAULT_LIMIT, { min: 1, max: MAX_LIMIT });

    if (!q || !String(q).trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const response = await axios.get(`${OPEN_LIBRARY_BASE_URL}/search.json`, {
      params: {
        q: String(q).trim(),
        page,
        limit,
        fields: [
          "key",
          "title",
          "author_name",
          "cover_i",
          "first_publish_year",
          "subject",
          "isbn",
          "language",
          "first_sentence",
        ].join(","),
      },
      timeout: 10000,
    });

    const total = Number(response.data?.numFound) || 0;
    const books = (response.data?.docs || []).map(normalizeSearchBook);

    return res.status(200).json({
      success: true,
      query: String(q).trim(),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      books,
    });
  } catch (error) {
    console.error("Open Library Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch books",
    });
  }
};

const getBookDetails = async (req, res) => {
  try {
    const openLibraryId = String(req.params.id || "").trim();

    if (!/^OL\d+W$/i.test(openLibraryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Open Library work id",
      });
    }

    const workPath = `/works/${openLibraryId}`;
    const [workResponse, editionsResponse] = await Promise.all([
      axios.get(`${OPEN_LIBRARY_BASE_URL}${workPath}.json`, { timeout: 10000 }),
      axios
        .get(`${OPEN_LIBRARY_BASE_URL}${workPath}/editions.json`, {
          params: { limit: 1 },
          timeout: 10000,
        })
        .catch(() => ({ data: { entries: [] } })),
    ]);

    const work = workResponse.data || {};
    const edition = editionsResponse.data?.entries?.[0] || {};
    const coverId = work.covers?.[0] || edition.covers?.[0] || null;
    const authorNames = [];

    if (Array.isArray(work.authors) && work.authors.length > 0) {
      const authorResponses = await Promise.all(
        work.authors.slice(0, 3).map((item) => {
          const key = item?.author?.key;
          if (!key) return Promise.resolve(null);
          return axios
            .get(`${OPEN_LIBRARY_BASE_URL}${key}.json`, { timeout: 10000 })
            .then((response) => response.data?.name)
            .catch(() => null);
        })
      );
      authorNames.push(...authorResponses.filter(Boolean));
    }

    const book = {
      _id: openLibraryId,
      id: openLibraryId,
      openLibraryId,
      key: work.key || workPath,
      title: work.title || edition.title || "Untitled Book",
      author: authorNames.join(", ") || "Unknown Author",
      coverImage: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null,
      description: normalizeDescription(work.description),
      category: work.subjects?.[0] || "Open Library",
      genre: "Open Library",
      subjects: (work.subjects || []).slice(0, 8),
      publicationDate: edition.publish_date || "",
      publishYear: edition.publish_date || "",
      isbn: edition.isbn_13?.[0] || edition.isbn_10?.[0] || "",
      language: edition.languages?.[0]?.key?.split("/").pop() || "",
      pageCount: edition.number_of_pages || null,
      averageRating: 0,
      totalRatings: 0,
      totalReads: 0,
      source: "openLibrary",
      openLibraryUrl: `${OPEN_LIBRARY_BASE_URL}${work.key || workPath}`,
    };

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    const status = error?.response?.status === 404 ? 404 : 500;
    console.error("Open Library Detail Error:", error.message);

    return res.status(status).json({
      success: false,
      message: status === 404 ? "Open Library book not found" : "Failed to fetch book details",
    });
  }
};

module.exports = { searchBooks, getBookDetails };
