/* A fotók önkéntes, helyi naplóbejegyzések; nem készül belőlük testösszetétel-becslés. */
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_MAX_INPUT_BYTES = 12 * 1024 * 1024;
export const PHOTO_MAX_EDGE = 1280;
export function validatePhotoFile(file) {
  if (!file || !PHOTO_TYPES.includes(file.type)) return 'type';
  if (!Number.isFinite(file.size) || file.size < 1 || file.size > PHOTO_MAX_INPUT_BYTES) return 'size';
  return null;
}
export function photoDimensions(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const factor = Math.min(1, PHOTO_MAX_EDGE / Math.max(width, height));
  return [Math.max(1, Math.round(width * factor)), Math.max(1, Math.round(height * factor))];
}
