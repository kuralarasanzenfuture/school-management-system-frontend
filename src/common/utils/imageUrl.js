const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getImageUrl = (path) => {
  if (!path) return "";

  let fullUrl = path;

  // If it's not already an absolute URL, prepend the base URL.
  if (!path.startsWith("http://") && !path.startsWith("https://")) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    fullUrl = `${BASE_URL}${normalizedPath}`;
  }

  //   console.log("Image URL:", fullUrl);

  return fullUrl;
};
