// BooksPage.jsx (additions highlighted with "NEW" comments)
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
import { searchOpenLibrary } from "../services/openLibraryApi";

const SKELETON_COUNT = 8;
const ROW_DISPLAY_COUNT = 9;
const PAGE_SIZE = 12;

// Popular categories to display as chips
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

const getTimeContext = () => {
  // ... unchanged
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return {
      greeting: "Good morning",
      gradient:
        "from-sky-100 via-indigo-50 to-white dark:from-indigo-950 dark:via-slate-900 dark:to-stone-950",
      accent: "text-indigo-900 dark:text-indigo-300",
    };
  if (hour >= 12 && hour < 17)
    return {
      greeting: "Good afternoon",
      gradient:
        "from-amber-50 via-yellow-50 to-white dark:from-yellow-950 dark:via-stone-900 dark:to-stone-950",
      accent: "text-amber-900 dark:text-amber-300",
    };
  if (hour >= 17 && hour < 21)
    return {
      greeting: "Good evening",
      gradient:
        "from-blue-100 via-purple-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-stone-950",
      accent: "text-blue-900 dark:text-indigo-300",
    };
  return {
    greeting: "Good night",
    gradient:
      "from-blue-100 via-purple-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-stone-950",
    accent: "text-blue-900 dark:text-indigo-300",
  };
};

// Row component unchanged (see original)
const Row = ({ title, icon: Icon, books, loading, onBookClick }) => {
  // ... same as before ...
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
          {Icon && <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />}
          {title}
        </h2>
        <div className="flex gap-2" aria-label={`Scroll ${title} row`}>
          <button
            onClick={() => scroll("left")}
            className="rounded-full border border-stone-300 p-1.5 text-stone-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-stone-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            aria-label="Scroll left"
          >
            <HiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full border border-stone-300 p-1.5 text-stone-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-stone-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
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
        aria-label={`${title} books list`}
        onKeyDown={handleKeyDown}
        className="book-list flex gap-5 overflow-x-auto scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {loading
          ? Array(ROW_DISPLAY_COUNT)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-[160px] sm:w-[175px] flex-shrink-0">
                  <BookCardSkeleton />
                </div>
              ))
          : books.map((book) => (
              <div
                key={book._id}
                className="w-[160px] sm:w-[175px] flex-shrink-0"
              >
                <BookCard
                  book={book}
                  onClick={() => onBookClick(book)}
                />
              </div>
            ))}
      </div>
    </section>
  );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ BooksPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BooksPage() {
  const navigate = useNavigate();

  // Main grid states (unchanged)
  const [books, setBooks] = useState([]);
  const [remoteBooks, setRemoteBooks] = useState([]);
  const [remotePage, setRemotePage] = useState(1);
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [remoteTotalPages, setRemoteTotalPages] = useState(1);
  const [openLibraryError, setOpenLibraryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Row data
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [bestBooks, setBestBooks] = useState([]);
  const [bestLoading, setBestLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(""); // NEW: track active category

  const { greeting, gradient } = getTimeContext();

  // ---- Debounced search ----
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setRemotePage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ---- Main grid (paginated) ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setPage(1);
      try {
        const params = { page: 1, limit: PAGE_SIZE };
        if (debouncedSearch) params.search = debouncedSearch;

        const localRequest = API.get("/books", { params });
        const remoteRequest = debouncedSearch
          ? searchOpenLibrary(debouncedSearch, { page: remotePage, limit: PAGE_SIZE })
          : Promise.resolve({ books: [], total: 0, totalPages: 1 });

        const [localResponse, remoteResponse] = await Promise.all([localRequest, remoteRequest]);
        if (ignore) return;

        const bookList = localResponse.data.books ?? localResponse.data ?? [];
        setBooks(bookList);
        setTotal(Number(localResponse.data.total) || bookList.length);

        const openLibraryBooks = (remoteResponse.books ?? []).map((book) => ({
          ...book,
          _id: book.id,
        }));
        setRemoteBooks(openLibraryBooks);
        setRemoteTotal(Number(remoteResponse.total) || openLibraryBooks.length);
        setRemoteTotalPages(Math.max(1, Number(remoteResponse.totalPages) || 1));
        setOpenLibraryError("");
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setBooks((prev) => prev || []);
          setRemoteBooks([]);
          setRemoteTotal(0);
          setRemoteTotalPages(1);
          setOpenLibraryError(debouncedSearch ? "Open Library results are unavailable right now." : "");
          setTotal((prev) => prev || 0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, remotePage]);

  // ---- Recently Added ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      setRecentLoading(true);
      try {
        const { data } = await API.get("/books", {
          params: { sort: "createdAt", order: "desc", limit: ROW_DISPLAY_COUNT },
        });
        if (ignore) return;
        setRecentBooks(data.books ?? data ?? []);
      } catch (err) {
        console.error("Recently added:", err);
      } finally {
        if (!ignore) setRecentLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // ---- Best Books ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      setBestLoading(true);
      try {
        const { data } = await API.get("/books", {
          params: { sort: "rating", order: "desc", limit: ROW_DISPLAY_COUNT },
        });
        if (ignore) return;
        setBestBooks(data.books ?? data ?? []);
      } catch (err) {
        console.error("Best books:", err);
      } finally {
        if (!ignore) setBestLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const isSearching = search.trim().length > 0;
  const displayedBooks = isSearching ? [...books, ...remoteBooks] : books;
  const hasMore = !isSearching && books.length < total;

  const loadMoreBooks = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = { page: nextPage, limit: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await API.get("/books", { params });
      const bookList = data.books ?? data ?? [];
      setBooks((prev) => [...prev, ...bookList]);
      setTotal(Number(data.total) || total);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBookClick = (book) => {
    if (book?.source === "openLibrary" && (book?.openLibraryId || book?.id)) {
      navigate(`/books/openlibrary/${book.openLibraryId || book.id}`);
      return;
    }
    if (book?._id) {
      navigate(`/books/${book._id}`);
    }
  };

  // NEW: handle category chip click
  const handleCategoryClick = (category) => {
    if (activeCategory === category) {
      // deselect
      setActiveCategory("");
      setSearch("");
    } else {
      setActiveCategory(category);
      setSearch(category);
    }
  };

  const gridClasses =
    "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] md:gap-x-5 md:gap-y-8";

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#18160f] animate-fade-in">
      <style>{`
        .book-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ========== HERO (unchanged) ========== */}
      {!isSearching && (
        <div
          className={`relative overflow-hidden bg-gradient-to-b ${gradient} px-4 pb-12 pt-16 sm:px-6 lg:px-8 transition-colors duration-1000`}
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400 mb-2">
              Library
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
              {greeting}, reader
            </h1>
            <p className="mt-3 max-w-xl text-base text-stone-600 dark:text-stone-300">
              Your next great read is waiting. Dive into curated shelves, old
              favourites, and hidden gems.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-800/70 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <HiSparkles className="h-3.5 w-3.5 text-indigo-500" />
                Personalized shelf
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-800/70 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 backdrop-blur-sm">
                <HiClock className="h-3.5 w-3.5 text-green-400" />
                Fresh updates
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========== SEARCH BAR ========== */}
      <div
        className={`sticky top-0 z-20 border-b border-stone-200/80 bg-[#faf8f3]/90 dark:border-stone-800 dark:bg-[#18160f]/90 backdrop-blur-md ${
          isSearching ? "py-4" : "py-3"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex-1" />
          <div className="relative w-full sm:w-80">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by title, author, or categoryâ€¦"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Clear active category if user manually types
                if (activeCategory && e.target.value !== activeCategory) {
                  setActiveCategory("");
                }
              }}
              className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-10 pr-9 text-[13.5px] text-stone-800 placeholder-stone-400 shadow-sm transition focus:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/15 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-indigo-500"
            />
            {isSearching && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("");
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <HiXMark className="text-base" />
              </button>
            )}
          </div>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CATEGORY CHIPS (NEW) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FEATURED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                    : "border-stone-300 text-stone-600 bg-white hover:border-indigo-300 hover:text-indigo-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-indigo-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== CONTENT ========== */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-16">
        {!isSearching && (
          <>
            <Row
              title="Recently Added"
              icon={HiClock}
              books={recentBooks}
              loading={recentLoading}
              onBookClick={handleBookClick}
            />
            <Row
              title="Best Books"
              icon={HiStar}
              books={bestBooks}
              loading={bestLoading}
              onBookClick={handleBookClick}
            />
          </>
        )}

        {/* ========== ALL BOOKS GRID ========== */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
              {isSearching
                ? `Results for "${activeCategory || search}"`
                : "All Books"}
            </h2>
            <div className="flex-1 border-t border-dashed border-stone-300 dark:border-stone-700" />
            {!loading && (
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {isSearching
                  ? `${remoteTotal.toLocaleString()} Open Library results`
                  : `${total.toLocaleString()} titles`}
              </span>
            )}
          </div>

          {isSearching && !activeCategory && (
            <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">
              Showing results for{" "}
              <span className="font-semibold text-stone-600 dark:text-stone-300">
                "{search}"
              </span>
            </p>
          )}
          {activeCategory && (
            <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">
              Browsing category:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {activeCategory}
              </span>
              <button
                onClick={() => { setSearch(""); setActiveCategory(""); }}
                className="ml-2 underline text-indigo-600 hover:text-indigo-800"
              >
                clear
              </button>
            </p>
          )}

          {openLibraryError && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              {openLibraryError}
            </div>
          )}

          <div className={gridClasses}>
            {loading
              ? Array(SKELETON_COUNT)
                  .fill(0)
                  .map((_, i) => <BookCardSkeleton key={i} />)
              : displayedBooks.map((book) => (
                  <BookCard
                    key={book.source === "openLibrary" ? `openlibrary-${book.openLibraryId || book.id}` : book._id ?? book.id}
                    book={book}
                    onClick={() => handleBookClick(book)}
                  />
                ))}
          </div>

          {!loading && isSearching && remoteTotalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setRemotePage((current) => Math.max(1, current - 1))}
                disabled={remotePage <= 1}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
              >
                <HiChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Open Library page {remotePage.toLocaleString()} of {remoteTotalPages.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setRemotePage((current) => Math.min(remoteTotalPages, current + 1))}
                disabled={remotePage >= remoteTotalPages}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
              >
                Next
                <HiChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {!loading && hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={loadMoreBooks}
                disabled={loadingMore}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-900 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {!loading && displayedBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-stone-300 dark:border-stone-700">
                <HiOutlineBookOpen className="text-3xl text-stone-300 dark:text-stone-600" />
              </div>
              <p className="font-serif text-[15px] font-semibold text-stone-700 dark:text-stone-300">
                No titles found
              </p>
              <p className="text-xs text-stone-400">
                Try a different search or browse our shelves.
              </p>
              {(search || activeCategory) && (
                <button
                  onClick={() => { setSearch(""); setActiveCategory(""); }}
                  className="mt-1 text-xs font-medium text-indigo-900 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


