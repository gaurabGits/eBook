import { useState } from "react";
import { HiOutlineBookOpen } from "react-icons/hi2";

const CoverImage = ({
  src,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName = "flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100",
  iconClassName = "text-4xl text-indigo-300",
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div className={fallbackClassName}>
        <HiOutlineBookOpen className={iconClassName} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-300 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default CoverImage;
