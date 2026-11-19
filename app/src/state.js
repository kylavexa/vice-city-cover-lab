// The editor state: which layout and grade, the words, the three photo
// slots and, per panel, which slot it shows and how its photo is cropped.
// History is a stack of JSON snapshots (photos stay out of it: the slots
// hold Image objects, and a snapshot only records slot indexes).

export const EXPORT_SIZES = [
  { id: '1080x1080', w: 1080, h: 1080, label: '1080 × 1080' },
  { id: '1080x1350', w: 1080, h: 1350, label: '1080 × 1350' },
  { id: '1920x1080', w: 1920, h: 1080, label: '1920 × 1080' },
];

/** The default state: Sunset Grid in Vice Sunset, samples in slots 0 and 1. */
export function createState() {
  return {
    layoutId: 'sunset-grid',
    gradeId: 'vice-sunset',
    caption: 'Sunset Heist',
    kicker: 'A Vice City Story',
    sizeId: '1080x1080',
    photos: [null, null, null],
    photoOf: {},
    transforms: {},
    selectedPanel: 0,
  };
}

/** The part of the state a snapshot stores (no Image objects). */
function snapshotable(state) {
  return {
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    caption: state.caption,
    kicker: state.kicker,
    sizeId: state.sizeId,
    photoOf: state.photoOf,
    transforms: state.transforms,
    selectedPanel: state.selectedPanel,
  };
}

/** Pushes the current state onto the undo stack (at most 25 entries). */
export function pushHistory(hist, state) {
  hist.past.push(JSON.stringify(snapshotable(state)));
  if (hist.past.length > 25) hist.past.shift();
  hist.future.length = 0;
}

/** Undoes one step; returns true when something changed. */
export function undoState(hist, state) {
  if (!hist.past.length) return false;
  hist.future.push(JSON.stringify(snapshotable(state)));
  const prev = JSON.parse(hist.past.pop());
  Object.assign(state, prev);
  return true;
}

/** Redoes one step; returns true when something changed. */
export function redoState(hist, state) {
  if (!hist.future.length) return false;
  hist.past.push(JSON.stringify(snapshotable(state)));
  const next = JSON.parse(hist.future.pop());
  Object.assign(state, next);
  return true;
}

/** A fresh, empty history. */
export function createHistory() {
  return { past: [], future: [] };
}

/** Resets one panel's crop (zoom and pan) and its photo override. */
export function resetPanel(state, key) {
  delete state.transforms[key];
  delete state.photoOf[key];
}
