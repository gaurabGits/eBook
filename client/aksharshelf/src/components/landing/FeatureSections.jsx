import {
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineChartBar,
} from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";

const FEATURES = [
  {
    icon: <HiOutlineSparkles />,
    title: "Smart Recommendations",
    desc: "Suggestions drawn from what you've actually read and rated, not generic bestseller lists.",
  },
  {
    icon: <HiOutlineBookOpen />,
    title: "Personal Bookshelf",
    desc: "Reading, finished, and next-up sorted onto one shelf you keep coming back to.",
  },
  {
    icon: <HiOutlineStar />,
    title: "Reviews & Ratings",
    desc: "Rate what you finish and write reviews that help other readers pick well.",
  },
  {
    icon: <HiOutlineChartBar />,
    title: "Reading Progress",
    desc: "Pages logged, habits tracked, and a shape to your reading over time.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="bg-[#faf7f0f8] px-6 py-20 sm:py-24 lg:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* ——— Header row: headline left, description + CTA right ——— */}
        <div className="grid grid-cols-1 gap-10 border-b border-[#0B2E13]/15 pb-14 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              The AksharShelf Platform
            </span>
            <h2
              id="features-heading"
              className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#0B2E13] sm:text-5xl"
            >
              Built for readers
              <br />
              who keep shelves
            </h2>
          </div>

          <div>
            <p className="text-base leading-relaxed text-justify text-[#1F3B24]/80 sm:text-lg">
              AksharShelf is a reading platform built around one habit
              keeping track of what you read. Discover new titles, organize
              your shelf, rate what you finish, and watch your reading take
              shape over time.
            </p>
            <a
              href="/books"
              className="mt-6 inline-flex items-center gap-2 rounded-sm border border-[#0B2E13] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#0B2E13] transition-colors hover:bg-[#0B2E13] hover:text-[#FAF7F0]"
            >
              Explore the Library
              <HiOutlineArrowRight className="text-base" />
            </a>
          </div>
        </div>

        {/* ——— Feature cards ——— */}
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-[#0B2E13]/15 bg-[#0B2E13]/15 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between bg-[#FAF7F0] p-7 transition-colors duration-300 hover:bg-white"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1F3B24]/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="text-xl text-indigo-400 bg-slate-100 p-2 rounded-md">{feature.icon}</div>
              </div>

              <div className="mt-8">
                <h3 className="font-serif text-lg font-bold text-[#0B2E13]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-justify text-[#1F3B24]/70">
                  {feature.desc}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}