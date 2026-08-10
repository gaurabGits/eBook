import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import { HiCheckCircle } from "react-icons/hi2";

export default function CTASection() {
    const token = localStorage.getItem("token");

    return (
        <section className="w-full bg-[#DAE8FC] py-14 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-12">
                <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
                    {/* Left column – heading + subtext */}
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#0B2E13] sm:text-4xl lg:text-[2.75rem]">
                            READY TO FIND
                            <br />
                            YOUR NEXT BOOK?
                        </h2>
                        <p className="mt-4 text-base text-[#1F3B24]/80 sm:text-lg">
                            Join thousands of readers on Akshar Shelf to
                            build your library, track your reading, and
                            discover stories worth staying up for.
                        </p>
                    </div>

                    {/* Right column – microcopy, checklist, buttons */}
                    <div className="w-full max-w-md shrink-0 lg:w-auto">
                        <p className="text-sm font-semibold text-[#0B2E13]">
                            Join Akshar Shelf for free. No cost, ever.
                        </p>

                        <ul className="mt-4 space-y-3">
                            <li className="flex items-center gap-2 text-sm text-[#1F3B24]">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-[#0B2E13]" />
                                Track every book you read
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[#1F3B24]">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-[#0B2E13]" />
                                Write and read honest reviews
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[#1F3B24]">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-[#0B2E13]" />
                                Build your shelf in minutes
                            </li>
                        </ul>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            {!token && (
                                <Link
                                    to="/auth/login"
                                    className="group inline-flex items-center justify-between gap-3 rounded-md bg-[#0B2E13] pl-5 pr-1.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a19] active:scale-[0.98]"
                                >
                                    <span>Join for free</span>
                                    <span className="flex h-9 w-9 items-center justify-center rounded bg-[#F5F06A] text-[#0B2E13] transition-transform group-hover:translate-x-0.5">
                                        <HiArrowRight className="text-base" />
                                    </span>
                                </Link>
                            )}
                            <Link
                                to="/books"
                                className="inline-flex items-center justify-center rounded-md bg-[#C7D9EF] px-6 py-3 text-sm font-semibold text-[#0B2E13] transition hover:bg-[#bacdea] active:scale-[0.98]"
                            >
                                Browse the shelf
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}