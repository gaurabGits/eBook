import { useEffect, useState, useRef, useCallback } from "react";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBookOpen,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
  HiStar,
  HiSparkles,
  HiClock,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BookCard, { BookCardSkeleton } from "../components/BookCard";
import { searchOpenLibrary } from "../services/OpenLibraryApi";

const PAGE_SIZE = 12;
const SKELETON_COUNT = 8;
const BEST_BOOKS_DISPLAY = 9; // Number of best books to fetch

const FEATURED_CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Fantasy",
  "Romance",
  "Biography",
  "Mystery",
  "Technology",
  "Philosophy",
  "Art",
];

/* ─── Horizontal Netflix‑style Row ───────────────────────── */
function BestBooksRow({ books, loading, onBookClick }) {
  const rowRef = useRef(null);

  const scroll = useCallback((direction) => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll("right");
    }
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
          <HiStar className="h-5 w-5 text-amber-500" />
          Best Reading
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400 transition"
            aria-label="Scroll left"
          >
            <HiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400 transition"
            aria-label="Scroll right"
          >
            <HiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        tabIndex={0}
        role="region"
        aria-label="Best books horizontal list"
        onKeyDown={handleKeyDown}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 rounded"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array(BEST_BOOKS_DISPLAY)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-[130px] sm:w-[150px] flex-shrink-0 snap-start">
                  <BookCardSkeleton />
                </div>
              ))
          : books.map((book) => (
              <div
                key={book._id}
                className="w-[130px] sm:w-[150px] flex-shrink-0 snap-start transition-transform duration-200 hover:scale-105 focus-within:scale-105"
              >
                <BookCard book={book} onClick={() => onBookClick(book)} />
              </div>
            ))}
      </div>
    </section>
  );
}

/* ─── Pagination Component ───────────────────────────────── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-stone-600 border border-stone-300 bg-white hover:border-stone-900 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
      >
        <HiChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-stone-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs font-medium border transition ${
              currentPage === p
                ? "border-stone-900 bg-stone-900 text-amber-50 dark:border-amber-500 dark:bg-amber-600 dark:text-stone-950"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-stone-600 border border-stone-300 bg-white hover:border-stone-900 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
      >
        <HiChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ─── Main BooksPage ─────────────────────────────────────── */
export default function BooksPage() {
  const navigate = useNavigate();

  // Best books state
  const [bestBooks, setBestBooks] = useState([]);
  const [bestLoading, setBestLoading] = useState(true);

  // Local books (our API, paginated)
  const [localBooks, setLocalBooks] = useState([]);
  const [localTotal, setLocalTotal] = useState(0);
  const [localPage, setLocalPage] = useState(1);
  const [localLoading, setLocalLoading] = useState(true);

  // Remote books (Open Library)
  const [remoteBooks, setRemoteBooks] = useState([]);
  const [remotePage, setRemotePage] = useState(1);
  const [remoteTotalPages, setRemoteTotalPages] = useState(1);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const localTotalPages = Math.max(1, Math.ceil(localTotal / PAGE_SIZE));
  const isSearching = search.trim().length > 0;

  // Fetch Best Books (once on mount)
  useEffect(() => {
    let active = true;
    (async () => {
      setBestLoading(true);
      try {
        const { data } = await API.get("/books", {
          params: { sort: "rating", order: "desc", limit: BEST_BOOKS_DISPLAY },
        });
        if (active) setBestBooks(data.books ?? data ?? []);
      } catch (err) {
        console.error("Best books fetch error:", err);
      } finally {
        if (active) setBestLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset local page when search changes
  useEffect(() => {
    setLocalPage(1);
    setRemotePage(1);
  }, [debouncedSearch]);

  // Fetch local books
  useEffect(() => {
    let active = true;
    (async () => {
      setLocalLoading(true);
      try {
        const params = { page: localPage, limit: PAGE_SIZE };
        if (debouncedSearch) params.search = debouncedSearch;
        const { data } = await API.get("/books", { params });
        if (active) {
          const books = data.books ?? data ?? [];
          setLocalBooks(books);
          setLocalTotal(Number(data.total) || books.length);
        }
      } catch (err) {
        console.error("Local books fetch error:", err);
        if (active) {
          setLocalBooks([]);
          setLocalTotal(0);
        }
      } finally {
        if (active) setLocalLoading(false);
      }
    })();
    return () => { active = false; };
  }, [localPage, debouncedSearch]);

  // Fetch Open Library (only when searching)
  useEffect(() => {
    if (!debouncedSearch) {
      setRemoteBooks([]);
      setRemoteTotalPages(1);
      setRemoteError("");
      return;
    }
    let active = true;
    (async () => {
      setRemoteLoading(true);
      setRemoteError("");
      try {
        const res = await searchOpenLibrary(debouncedSearch, { page: remotePage, limit: PAGE_SIZE });
        if (active) {
          const books = (res.books ?? []).map((b) => ({ ...b, _id: b.id, source: "openLibrary" }));
          setRemoteBooks(books);
          setRemoteTotalPages(Math.max(1, Number(res.totalPages) || 1));
        }
      } catch (err) {
        console.error("Open Library fetch error:", err);
        if (active) {
          setRemoteBooks([]);
          setRemoteTotalPages(1);
          setRemoteError("Open Library results are unavailable right now.");
        }
      } finally {
        if (active) setRemoteLoading(false);
      }
    })();
    return () => { active = false; };
  }, [remotePage, debouncedSearch]);

  const displayedBooks = isSearching
    ? [...localBooks, ...remoteBooks]
    : localBooks;

  const handleBookClick = (book) => {
    if (book?.source === "openLibrary" && (book?.openLibraryId || book?.id)) {
      navigate(`/books/openlibrary/${book.openLibraryId || book.id}`);
      return;
    }
    if (book?._id) navigate(`/books/${book._id}`);
  };

  const handleCategoryClick = (category) => {
    if (activeCategory === category) {
      setActiveCategory("");
      setSearch("");
    } else {
      setActiveCategory(category);
      setSearch(category);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setActiveCategory("");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#0B0D14]">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          scrollbar-width: none;
        }
        /* Hide scrollbar on the Best Books row too */
        .snap-x::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ── Sticky search bar ───────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#FAF7F0]/95 dark:border-stone-800/80 dark:bg-[#0B0D14]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand / Page title */}
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-2xl">
              Discover Books
            </h1>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (activeCategory && e.target.value !== activeCategory) setActiveCategory("");
              }}
              className="w-full rounded border border-stone-300 bg-white py-2.5 pl-10 pr-9 text-sm text-stone-800 placeholder-stone-400 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
            />
            {isSearching && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <HiXMark className="text-base" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Best Books Horizontal Row ───────────────── */}
      {!isSearching && (
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-2 sm:px-6 lg:px-8">
          <BestBooksRow
            books={bestBooks}
            loading={bestLoading}
            onBookClick={handleBookClick}
          />
        </div>
      )}

      {/* ── Main content: sidebar + grid ────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* ── Left sidebar (desktop) / horizontal scroll (mobile) ── */}
          <aside className="md:w-48 lg:w-56 flex-shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-2 md:hidden">
              {FEATURED_CATEGORIES.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`whitespace-nowrap border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? "border-stone-900 bg-stone-900 text-amber-50 dark:border-amber-500 dark:bg-amber-600 dark:text-stone-950"
                        : "border-stone-300 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical list */}
            <div className="hidden md:block">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => { setActiveCategory(""); setSearch(""); }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-colors ${
                      !activeCategory
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                  >
                    All Books
                  </button>
                </li>
                {FEATURED_CATEGORIES.map((cat) => {
                  const active = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-colors ${
                          active
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ── Right side: book grid ───────────────── */}
          <main className="flex-1 min-w-0 mt-6 md:mt-0">
            {/* Status messages */}
            {isSearching && !activeCategory && (
              <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">
                Showing results for{" "}
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  "{search}"
                </span>
              </p>
            )}
            {activeCategory && (
              <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">
                Browsing category:{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-500">
                  {activeCategory}
                </span>
                <button
                  onClick={clearSearch}
                  className="ml-2 font-medium text-stone-500 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-amber-400"
                >
                  clear
                </button>
              </p>
            )}

            {remoteError && (
              <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                {remoteError}
              </div>
            )}

            {/* Book grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(localLoading || (isSearching && remoteLoading))
                ? Array(SKELETON_COUNT)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="mx-auto w-full max-w-[150px]">
                        <BookCardSkeleton />
                      </div>
                    ))
                : displayedBooks.map((book) => (
                    <div
                      key={
                        book.source === "openLibrary"
                          ? `openlibrary-${book.openLibraryId || book.id}`
                          : book._id ?? book.id
                      }
                      className="mx-auto w-full max-w-[150px]"
                    >
                      <BookCard book={book} onClick={() => handleBookClick(book)} />
                    </div>
                  ))}
            </div>

            {/* Empty state */}
            {!localLoading && !remoteLoading && displayedBooks.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-dashed border-stone-300 dark:border-stone-700">
                  <HiOutlineBookOpen className="text-2xl text-stone-300 dark:text-stone-600" />
                </div>
                <p className="font-serif text-sm font-semibold text-stone-800 dark:text-stone-200">
                  No titles found
                </p>
                <p className="text-xs text-stone-400">
                  Try a different search or browse our shelves.
                </p>
                {(search || activeCategory) && (
                  <button
                    onClick={clearSearch}
                    className="mt-1 text-xs font-medium text-stone-700 underline underline-offset-2 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Pagination (local) */}
            {!isSearching && (
              <Pagination
                currentPage={localPage}
                totalPages={localTotalPages}
                onPageChange={setLocalPage}
              />
            )}

            {/* Open Library pagination (visible when searching) */}
            {isSearching && remoteTotalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => setRemotePage((p) => Math.max(1, p - 1))}
                  disabled={remotePage <= 1}
                  className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 shadow-sm transition hover:border-stone-900 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
                >
                  <HiChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Open Library page {remotePage.toLocaleString()} of {remoteTotalPages.toLocaleString()}
                </span>
                <button
                  onClick={() => setRemotePage((p) => Math.min(remoteTotalPages, p + 1))}
                  disabled={remotePage >= remoteTotalPages}
                  className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 shadow-sm transition hover:border-stone-900 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400"
                >
                  Next
                  <HiChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}