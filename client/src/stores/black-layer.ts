import { atom } from "nanostores";

/**
 * The atom to control whether the black layer is shown at z-index 30, covering the screen.
 */
export const $blackLayer = atom(false);
