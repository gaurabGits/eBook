import { useEffect, useState } from "react";
import { HiOutlineBookOpen } from "react-icons/hi2";

const CoverImage = ({
  src,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName = "flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100",
  iconClassName = "text-4xl text-indigo-300",
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={fallbackClassName}>
        <HiOutlineBookOpen className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

export default CoverImage;
