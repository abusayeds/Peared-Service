/**
 * Resolve image URLs from API data.
 * New uploads return full Cloudinary URLs — use them directly.
 * Legacy relative paths (e.g. /images/...) no longer work and return fallback.
 */
export function getImageUrl(image, fallback = null) {
  if (!image || typeof image !== "string") {
    return fallback;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return fallback;
}
