import { atom } from "nanostores";

const $popup = atom<HTMLElement | null>(null);

export { $popup };
