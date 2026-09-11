export function getSafeImageUrl(value?: string | null) {
  const imageUrl = value?.trim();

  if (!imageUrl) return null;
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? imageUrl
      : null;
  } catch {
    return null;
  }
}