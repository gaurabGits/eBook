import { useState, useId } from "react";

// ─── Configuration ───────────────────────────────────────────────

const ISBNS = [
  "9780062060624", "9781501110368", "9780735211292", "9780399590504",
  "9780316556347", "9780441013593", "9780061120084", "9780525559474",
  "9781524763138", "9780593135204", "9780307474278", "9780316769488",
  "9780743273565", "9780345339683", "9780439023481", "9780385737951",
  "9781984822185", "9780571364886", "9780316015844", "9780593318171",
  "9780765326355", "9780553296983", "9780545010221", "9780062315007",
];

function coverUrl(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
}

const WALL_ISBNS = Array.from({ length: 96 }, (_, i) => ISBNS[i % ISBNS.length]);

// ─── CoverWall (archival, desaturated — texture not decoration) ──

function CoverWall() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#EDE6D3]" aria-hidden="true">
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9">
        {WALL_ISBNS.map((isbn, i) => (
          <div key={`${isbn}-${i}`} className="aspect-[2/3] overflow-hidden bg-[#DCD3B8]">
            <img
              src={coverUrl(isbn)}
              alt=""
              loading="lazy"
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
              style={{ filter: "sepia(0.55) contrast(0.92) brightness(0.95)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        ))}
      </div>
      {/* Parchment wash — pushes the wall back into texture, not foreground */}
      <div className="absolute inset-0 bg-[#FAF7F0]/[0.86]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F0]/40 via-[#FAF7F0]/70 to-[#FAF7F0]" />
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const searchInputId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("[Hero] Search term:", searchTerm);
      setStatus("success");
      setSearchTerm("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-16">
      <CoverWall />

      <div className="relative z-10 flex w-full max-w-[640px] flex-col items-center">
        {/* Ledger eyebrow */}
        <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-[#8A7F68]">
          <span className="h-px w-8 bg-[#8A7F68]/50" />
          Reading Log &amp; Catalog
          <span className="h-px w-8 bg-[#8A7F68]/50" />
        </div>

        <h1 className="text-balance text-center font-serif text-4xl leading-[1.15] tracking-tight text-[#1C1B1A] sm:text-5xl">
          Discover, track &amp; <em className="italic text-[#A8721C]">love</em> every
          book you read.
        </h1>

        <p className="mt-5 max-w-[420px] text-center text-[15px] text-[#6B6558]">
          Search the shelf — find your next read instantly.
        </p>

        {/* ── Signature element: the catalog card ── */}
        <div className="relative mt-10 w-full max-w-[520px]">
          {/* Punch hole, top-left — as if strung on a catalog rod */}
          <div className="absolute -top-3 left-6 h-4 w-4 rounded-full border border-[#C9BFA3] bg-[#FAF7F0] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]" />

          <div
            className="relative border border-[#C9BFA3] bg-[#FDFBF5] px-6 pb-6 pt-7 shadow-[0_2px_0_#C9BFA3,0_18px_36px_-18px_rgba(28,27,26,0.35)]"
            style={{ clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)" }}
          >
            {/* Call-number style label row */}
            <div className="mb-3 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-[#A8721C]">
              <span>No. 000-001</span>
              <span className="text-[#8A7F68]">Title / Author / Keyword</span>
            </div>

            <form onSubmit={handleSubmit} className="flex items-stretch gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <input
                  id={searchInputId}
                  type="search"
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Circe, or Madeline Miller…"
                  disabled={status === "loading" || status === "success"}
                  className="w-full bg-transparent pb-2 font-serif text-[17px] text-[#1C1B1A] outline-none placeholder:text-[#B3A98E] disabled:opacity-50"
                />
                <span className="h-px w-full bg-[#C9BFA3]" />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="group inline-flex shrink-0 items-center gap-2 self-end rounded-sm border border-[#1C1B1A] bg-[#1C1B1A] px-5 py-2.5 text-sm font-medium text-[#FAF7F0] transition-all hover:bg-[#A8721C] hover:border-[#A8721C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8721C]/50 disabled:opacity-50"
              >
                {status === "loading" ? "Searching…" : "Search"}
                <span className="font-serif italic transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </form>
          </div>

          {/* Stacked card edges, like cards behind it in the drawer */}
          <div className="absolute inset-x-2 -bottom-1.5 -z-10 h-full border border-[#C9BFA3] bg-[#F3EDDC]" />
          <div className="absolute inset-x-4 -bottom-3 -z-20 h-full border border-[#C9BFA3] bg-[#EDE6D3]" />
        </div>

        {/* Ledger footer line, dot-leader style */}
        <div className="mt-8 flex w-full max-w-[420px] items-center gap-2 font-mono text-[11px] text-[#8A7F68]">
          <span>Free forever</span>
          <span className="flex-1 border-b border-dotted border-[#C9BFA3]" />
          <span>No ads · No card required</span>
        </div>
      </div>
    </section>
  );
}