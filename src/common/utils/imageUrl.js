const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5000";

/**
 * Resolves a relative image path into a full public URL.
 * Handles existing full URLs (http/https), data URLs, blob URLs, and relative paths.
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (typeof path !== "string") return null;

  // Already an absolute URL or embedded data/blob URL
  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const cleanBase = (BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${normalizedPath}`;
}

export default getImageUrl;
