import { atom } from "nanostores";
import { $blackLayer } from "./black-layer";

/**
 * The element to display in the pop-up.
 */
const $popup = atom<HTMLElement | null>(null);

// Subscribe to the store changes, if the popup appears then,
// the black layer is also shown.
$popup.listen((val) => {
  $blackLayer.set(val !== null);
});

export { $popup };
