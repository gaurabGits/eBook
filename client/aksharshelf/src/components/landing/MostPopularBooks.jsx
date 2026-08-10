import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

// Fallback titles used to pull cover art from OpenLibrary when we want to
// pad out the strip beyond what's currently in our own database.
const OPEN_LIBRARY_TITLES = [
  "The Great Gatsby",
  "1984",
  "To Kill a Mockingbird",
  "Pride and Prejudice",
  "The Hobbit",
  "Sapiens",
  "The Alchemist",
  "Atomic Habits",
];

function MostPopularBooks() {
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Our own most-read / most-reviewed books
        const dbRes = await API.get("/books", {
          params: { page: 1, limit: 10, sort: "popular" },
        }).catch(() => null);

        const dbCovers = (dbRes?.data?.books ?? dbRes?.data ?? [])
          .filter((b) => b.coverImage)
          .map((b) => ({
            id: b._id,
            src: b.coverImage,
            alt: b.title,
            href: `/books/${b._id}`,
            external: false,
          }));

        // Pad with OpenLibrary covers so the strip always feels full
        const olResults = await Promise.all(
          OPEN_LIBRARY_TITLES.map((title) =>
            fetch(
              `https://openlibrary.org/search.json?title=${encodeURIComponent(
                title
              )}&limit=1`
            )
              .then((r) => r.json())
              .catch(() => null)
          )
        );

        const olCovers = olResults
          .map((res) => res?.docs?.[0])
          .filter((doc) => doc?.cover_i)
          .map((doc) => ({
            id: doc.key,
            src: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
            alt: doc.title,
            // Not in our own catalog yet, so send readers to the
            // OpenLibrary page for that title instead of a 404.
            href: `https://openlibrary.org${doc.key}`,
            external: true,
          }));

        if (!cancelled) {
          setCovers([...dbCovers, ...olCovers]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Duplicate the set so the CSS animation can loop seamlessly at -50%
  const loopCovers = covers.length > 0 ? [...covers, ...covers] : [];

  return (
    <section className="w-full overflow-hidden bg-[#F3EFE1] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#0B2E13] sm:text-4xl lg:text-[2.75rem]">
          Most Popular Books
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#1F3B24]/80 sm:text-lg">
          Discover what other readers are enjoying and find your next great read.
        </p>
      </div>

      <div className="relative mt-10">
        {loading && (
          <div className="flex gap-4 px-6 sm:gap-5">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-[170px] flex-shrink-0 animate-pulse rounded-xl bg-[#e5e0cf] sm:w-[190px]"
                />
              ))}
          </div>
        )}

        {!loading && loopCovers.length > 0 && (
          <div
            className="popular-books-mask"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="popular-books-track flex w-max gap-4 sm:gap-5"
              style={{ animationPlayState: paused ? "paused" : "running" }}
            >
              {loopCovers.map((c, i) =>
                c.external ? (
                  <a
                    key={`${c.id}-${i}`}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-[2/3] w-[170px] flex-shrink-0 overflow-hidden rounded-xl shadow-md transition-transform duration-300 sm:w-[190px]"
                  >
                    <img
                      src={c.src}
                      alt={c.alt}
                      className="h-full w-full object-cover object-top"
                      loading="lazy"
                      draggable={false}
                    />
                  </a>
                ) : (
                  <Link
                    key={`${c.id}-${i}`}
                    to={c.href}
                    className="aspect-[2/3] w-[170px] flex-shrink-0 overflow-hidden rounded-xl shadow-md transition-transform duration-300 sm:w-[190px]"
                  >
                    <img
                      src={c.src}
                      alt={c.alt}
                      className="h-full w-full object-cover object-top"
                      loading="lazy"
                      draggable={false}
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .popular-books-mask {
          overflow: hidden;
        }
        .popular-books-track {
          animation: popular-books-scroll 140s linear infinite;
          will-change: transform;
        }
        @keyframes popular-books-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 640px) {
          .popular-books-track {
            animation-duration: 100s;
          }
        }
      `}</style>
    </section>
  );
}

export default MostPopularBooks;