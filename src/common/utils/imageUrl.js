import { getFullImageUrl } from "../../config/env.js";

/**
 * Resolves a relative image path into a full public URL.
 * Uses IMAGE_BASE_URL from src/config/env.js (strips /api and handles base64/blob/fallbacks).
 */
export const getImageUrl = getFullImageUrl;

export default getImageUrl;
