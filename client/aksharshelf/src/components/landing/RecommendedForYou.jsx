import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { HiArrowRight, HiChevronLeft, HiChevronRight, HiOutlineBookOpen } from "react-icons/hi2";
import API from "../../services/api";
import CoverImage from "../CoverImage";

const STYLES = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .slide-right { animation: slideInRight 0.4s ease both; }
  .scroll-row::-webkit-scrollbar { display: none; }
  .scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
`;

function RecommendedForYou() {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [visible, setVisible]   = useState(false);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);
  const rowRef     = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/books", {
          params: { page: 1, limit: 15, },
        });
        setBooks(res.data.books ?? res.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.min(420, Math.max(240, Math.round(el.clientWidth * 0.85)));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  };

  return (
    <>
      <style>{STYLES}</style>

      <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-violet-100 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 section-pad">
        <div className="page-container">
        
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
                Readers Also Enjoyed
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link to="/books?filter=free" className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                See all <HiArrowRight className="text-sm" />
              </Link>
              <div className="hidden gap-1.5 sm:flex">
                <button onClick={() => scroll("left")} disabled={!canLeft}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  <HiChevronLeft />
                </button>
                <button onClick={() => scroll("right")} disabled={!canRight}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  <HiChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          {loading && (
            <div className="flex gap-3 overflow-hidden sm:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[177/266] w-[160px] flex-shrink-0 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-800 sm:w-[175px]"
                />
              ))}
            </div>
          )}

          {/* Scroll row */}
          {!loading && books.length > 0 && (
            <div ref={rowRef} onScroll={updateArrows} className=" h-full scroll-row flex gap-3 overflow-x-auto pb-2 sm:gap-4">
              {books.map((book, i) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className={` max-h-full group w-[160px] flex-shrink-0 no-underline sm:w-[180px] ${visible ? "slide-right" : "opacity-0"}`}
                  style={visible ? { animationDelay: `${i * 60}ms` } : {}}
                >
                  <div className="relative aspect-[85/150] w-full overflow-hidden rounded-xl shadow-md transition-all duration-300">

                    {/* Cover image — full, no tint */}
                    <CoverImage
                      src={book.coverImage}
                      alt={book.title}
                      className="absolute wd inset-0 h-full w-full object-cover"
                      fallbackClassName="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-stone-100 to-slate-200 dark:from-slate-900/80 dark:via-stone-900/80 dark:to-slate-800/80"
                      iconClassName="text-4xl text-slate-500 dark:text-slate-400"
                    />

                    {/* Subtle bottom gradient so text is readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none" />

                    <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                      <div className="flex items-center gap-1 text-white text-[10px] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Read now <HiArrowRight className="text-xs" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && books.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <HiOutlineBookOpen className="text-5xl text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-400">No books available yet</p>
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default RecommendedForYou;
