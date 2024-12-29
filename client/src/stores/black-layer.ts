import { atom } from "nanostores";

/**
 * If this is true, a low-opacity black layer would cast over the screen at z-index 30.
 * This is to highlight some elements while taking away focus from others visually.
 */
export const $blackLayer = atom(false);
