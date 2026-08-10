import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";



const ISBNS = [
  "9780062060624",
  "9781501110368",
  "9780735211292",
  "9780399590504",
  "9780316556347",
  "9780441013593",
  "9780061120084",
  "9780525559474",
  "9781524763138",
  "9780593135204",
  "9780307474278",
  "9780316769488",
  "9780743273565",
  "9780345339683",
  "9780439023481",
  "9780385737951",
  "9781984822185",
  "9780571364886",
  "9780316015844",
  "9780593318171",
  "9780765326355",
  "9780553296983",
  "9780545010221",
  "9780062315007",
];


function coverUrl(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
}

const WALL_ISBNS = Array.from(
  { length: 96 },
  (_, i) => ISBNS[i % ISBNS.length]
);


function CoverWall() {
  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden`}
      aria-hidden="true"
    >
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9">
        {WALL_ISBNS.map((isbn, i) => (
          <div
            key={`${isbn}-${i}`}
            className="aspect-[2/3] overflow-hidden"
          >
            <img
              src={coverUrl(isbn)}
              alt=""
              loading="lazy"
              crossOrigin="anonymous"
              className="h-full w-full object-cover object-top opacity-90 "
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


export function HeroSection() {
  const [query, setQuery] = useState("");
  const searchInputId = useId();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/books?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 sm:py-12 md:py-16">
      <CoverWall />

      <div className="relative z-10 flex w-full max-w-[640px] justify-center">
        <div className="w-full rounded-2xl bg-white/95 backdrop-blur-sm px-8 py-12 shadow-2xl shadow-[#0B2E13]/25 ring-1 ring-[#0B2E13]/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-3 sm:px-12 sm:py-14">
          {/* Headline */}
          <h1 className="text-pretty font-serif text-3xl leading-[1.15] tracking-tight text-[#0B2E13] sm:text-4xl md:text-[2.75rem]">
            Discover Your Next <span className="italic space-x-5 text-serif font-bold">Favorite </span> Book
          </h1>

          <p className="mt-2 leading-[1.5] text-sm text-[#1F3B24]/70 sm:text-[15px]">
            Explore a curated collection of books from OpenLibrary and our own catalog. Search by title, author, or keyword to find your next great read.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-12 flex items-stretch gap-2 rounded-full border-2 border-indigo-500 bg-white p-1.5 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-indigo-500/25"
          >
            <label htmlFor={searchInputId} className="sr-only">
              Search for books
            </label>
            <input
              id={searchInputId}
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or keyword…"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-[#0B2E13] outline-none placeholder:text-[#0B2E13]/40 sm:text-[15px]"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-600 active:scale-[0.98]"
            >
              Search
              <FaSearch className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}