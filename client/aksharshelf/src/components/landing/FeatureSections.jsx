import {
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineChartPie,
  HiOutlinePencil,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineDocument,
  HiOutlineClipboard,
  HiOutlineFolder,
  HiOutlineBookmark,
  HiOutlinePrinter,
} from "react-icons/hi";

const FEATURES = [
  {
    icon: <HiOutlineSparkles />,
    title: "Smart Recommendations",
    desc: "Based on what you've read and loved, we'll suggest books we think you'll enjoy next.",
  },
  {
    icon: <HiOutlineBookOpen />,
    title: "Personal Bookshelf",
    desc: "Organize what you're reading, what's finished, and what's next — all in one shelf.",
  },
  {
    icon: <HiOutlineStar />,
    title: "Reviews & Ratings",
    desc: "Rate books and write reviews to help other readers find their next favorite.",
  },
  {
    icon: <HiOutlineChartBar />,
    title: "Reading Progress",
    desc: "Track pages read and watch your reading habits take shape over time.",
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Secure Profiles",
    desc: "Your account and data stay protected with modern, encrypted authentication.",
  },
  {
    icon: <HiOutlineChartPie />,
    title: "Admin Dashboard",
    desc: "A dedicated space to manage books, users, and activity across the platform.",
  },
];


export default function FeaturesSection() {
  return (
    <>
      <section
        className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white px-4 py-16 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950 sm:py-20 lg:py-28"
        aria-labelledby="features-heading"
      >
        {/* ——— Floating Background Icons ——— */}
      

        {/* ——— Header ——— */}
        <div className="relative mx-auto max-w-6xl">
          <div className="relative mb-12 text-center sm:mb-16 lg:mb-20">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              ✦ What's inside
            </span>

            <h2
              id="features-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl"
            >
              Major features of{" "}
              <span className="relative inline-block">
                Akshar Shelf
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-400 to-amber-400/80 dark:from-indigo-500 dark:to-amber-500/60"
                />
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              Everything you need to build your perfect reading world — clean,
              simple, and thoughtfully crafted.
            </p>
          </div>

          {/* ——— Feature Cards ——— */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col rounded-2xl border border-indigo-100/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:border-indigo-700/40 dark:hover:shadow-indigo-500/5 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-amber-300/0 transition-all duration-300 group-hover:bg-amber-300/60 dark:group-hover:bg-amber-500/30"
                />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-300">
                    {feature.icon}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent ring-offset-2 transition-all duration-300 group-focus-visible:ring-indigo-400 dark:group-focus-visible:ring-indigo-500" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}