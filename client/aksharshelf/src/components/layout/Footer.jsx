import { Link } from "react-router-dom";
import SystemLogo from "../Logo/SystemLogo";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const EXPLORE = [
  { to: "/", label: "Homepage" },
  { to: "/books", label: "Books" },
  { to: "/about", label: "About" },
];

const READING = [
  { to: "/books", label: "Start Reading" },
  { to: "/my-library", label: "My Library" },
];

const SOCIALS = [
  { href: "https://github.com/gaurabGits", label: "GitHub", Icon: FaGithub },
  {
    href: "https://www.linkedin.com/in/gaurab-bishwakarma-a7a66a272/",
    label: "LinkedIn",
    Icon: FaLinkedin,
  },
];

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8F8577] dark:text-[#6B6255]">
        {title}
      </p>
      <nav className="flex flex-col gap-2.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="w-fit text-sm text-[#4A4436] transition-colors
                       duration-150 hover:text-[#0B2E13] focus-visible:outline-none
                       focus-visible:text-[#0B2E13] dark:text-[#D8D2C4]
                       dark:hover:text-amber-500 dark:focus-visible:text-amber-500"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#DDD5C4] bg-gradient-to-b from-[#FAF7F0] via-[#F3EEE1] to-[#E9E1CC] dark:border-[#2A261E] dark:from-[#15130F] dark:via-[#1B1812] dark:to-[#0F2016]">
      <div className="page-container py-14">
        {/* Top row */}
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex max-w-xs flex-col gap-3">
            <div className="flex items-center gap-2">
              <SystemLogo className="h-6 w-6 shrink-0 text-[#0B2E13] dark:text-[#EEE9DE]" />
            </div>
            <p className="text-sm text-justify leading-relaxed text-[#8F8577] dark:text-[#6B6255]">
              A quiet shelf for readers who like to keep track of what
              they've read, and what's next.
            </p>
          </div>

          {/* Columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <FooterColumn title="Explore" links={EXPLORE} />
            <FooterColumn title="Reading" links={READING} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-[#DDD5C4] dark:bg-[#2A261E]" />

        {/* Bottom row */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8F8577] dark:text-[#6B6255]">
            &copy; {new Date().getFullYear()} Akshar Shelf. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-5">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#8F8577] transition-colors duration-150
                             hover:text-[#0B2E13] focus-visible:outline-none
                             focus-visible:text-[#0B2E13] dark:text-[#6B6255]
                             dark:hover:text-amber-500 dark:focus-visible:text-amber-500"
                >
                  <Icon className="h-[20px] w-[20px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}