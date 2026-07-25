import React, { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HashScrollManager from "./HashScrollManager";
import Loader from "../Loader";
import { isPageLoaded, markPageLoaded } from "../../utils/loadedPages";

const getPageKey = (location) => location.pathname || "/";

function GlobalDelayHandler() {
  const location = useLocation();
  const pageKey = getPageKey(location);

  useEffect(() => {
    const handleDelay = (event) => {
      const delayed = Boolean(event.detail?.isDelayed);

      if (!delayed) {
        markPageLoaded(pageKey);
      }
    };

    window.addEventListener("app:delay_loading", handleDelay);
    return () => window.removeEventListener("app:delay_loading", handleDelay);
  }, [pageKey]);

  return null;
}

function RouteLoaderFallback() {
  const location = useLocation();
  const pageKey = getPageKey(location);

  if (isPageLoaded(pageKey)) return null;

  return <Loader fullScreen text="Loading page..." />;
}

export default function Layout() {
  const location = useLocation();
  const isReaderRoute = location.pathname === "/read" || location.pathname.startsWith("/read/");

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 overflow-x-hidden">
      <HashScrollManager />
      {!isReaderRoute ? <Navbar /> : null}
      {!isReaderRoute ? <GlobalDelayHandler /> : null}
      <main className={`flex-1 ${isReaderRoute ? "pt-0" : "pt-16"}`}>
        <Suspense fallback={<RouteLoaderFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!isReaderRoute ? <Footer /> : null}
    </div>
  );
}
