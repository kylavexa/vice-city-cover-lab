// Panel geometry for the eight cover layouts. Every rect is a fraction of
// the cover (0..1). A panel shows one photo slot; `rot` tilts it in degrees.
// The title zone is where the caption block goes: `kind` is 'band' (a solid
// block), 'overlay' (text over a dark scrim), 'header' (a top band) or
// 'ribbon' (a band laid across the middle of the panels).

export const LAYOUTS = [
  {
    id: 'sunset-grid',
    name: 'Sunset Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.42, rot: 0, photo: 0 },
      { x: 0.5, y: 0, w: 0.5, h: 0.42, rot: 0, photo: 1 },
      { x: 0, y: 0.42, w: 0.5, h: 0.42, rot: 0, photo: 2 },
      { x: 0.5, y: 0.42, w: 0.5, h: 0.42, rot: 0, photo: 0 },
    ],
    title: { x: 0, y: 0.84, w: 1, h: 0.16, align: 'center', kind: 'band' },
  },
  {
    id: 'hero-bleed',
    name: 'Hero Bleed',
    panels: [{ x: 0, y: 0, w: 1, h: 1, rot: 0, photo: 0 }],
    title: { x: 0, y: 0.68, w: 1, h: 0.32, align: 'left', kind: 'overlay' },
  },
  {
    id: 'tilted-snaps',
    name: 'Tilted Snaps',
    panels: [
      { x: 0.05, y: 0.24, w: 0.42, h: 0.52, rot: -7, photo: 0 },
      { x: 0.3, y: 0.16, w: 0.42, h: 0.58, rot: 0, photo: 1 },
      { x: 0.56, y: 0.26, w: 0.4, h: 0.5, rot: 7, photo: 2 },
    ],
    title: { x: 0, y: 0.02, w: 1, h: 0.14, align: 'center', kind: 'header' },
  },
  {
    id: 'neon-strip',
    name: 'Neon Strip',
    panels: [
      { x: 0, y: 0, w: 0.333, h: 0.46, rot: 0, photo: 0 },
      { x: 0.333, y: 0, w: 0.334, h: 0.46, rot: 0, photo: 1 },
      { x: 0.667, y: 0, w: 0.333, h: 0.46, rot: 0, photo: 2 },
    ],
    title: { x: 0, y: 0.46, w: 1, h: 0.54, align: 'center', kind: 'band' },
  },
  {
    id: 'nine-panel',
    name: 'Nine Panel',
    panels: [
      { x: 0, y: 0, w: 0.333, h: 0.28, rot: 0, photo: 0 },
      { x: 0.333, y: 0, w: 0.334, h: 0.28, rot: 0, photo: 1 },
      { x: 0.667, y: 0, w: 0.333, h: 0.28, rot: 0, photo: 2 },
      { x: 0, y: 0.28, w: 0.333, h: 0.28, rot: 0, photo: 1 },
      { x: 0.333, y: 0.28, w: 0.334, h: 0.28, rot: 0, photo: 2 },
      { x: 0.667, y: 0.28, w: 0.333, h: 0.28, rot: 0, photo: 0 },
      { x: 0, y: 0.56, w: 0.333, h: 0.28, rot: 0, photo: 2 },
      { x: 0.333, y: 0.56, w: 0.334, h: 0.28, rot: 0, photo: 0 },
      { x: 0.667, y: 0.56, w: 0.333, h: 0.28, rot: 0, photo: 1 },
    ],
    title: { x: 0, y: 0.4, w: 1, h: 0.2, align: 'center', kind: 'ribbon' },
  },
  {
    id: 'duo-split',
    name: 'Duo Split',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1, rot: 0, photo: 0 },
      { x: 0.5, y: 0, w: 0.5, h: 1, rot: 0, photo: 1 },
    ],
    title: { x: 0, y: 0.8, w: 1, h: 0.2, align: 'center', kind: 'overlay' },
  },
  {
    id: 'poster-frame',
    name: 'Poster Frame',
    panels: [{ x: 0.07, y: 0.17, w: 0.86, h: 0.59, rot: 0, photo: 0 }],
    title: { x: 0, y: 0, w: 1, h: 0.17, align: 'center', kind: 'header' },
    footer: { x: 0, y: 0.76, w: 1, h: 0.24, align: 'center', kind: 'band', notitle: true },
  },
  {
    id: 'boulevard',
    name: 'Boulevard',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.56, rot: 0, photo: 0 },
      { x: 0, y: 0.56, w: 0.5, h: 0.27, rot: 0, photo: 1 },
      { x: 0.5, y: 0.56, w: 0.5, h: 0.27, rot: 0, photo: 2 },
    ],
    title: { x: 0, y: 0.83, w: 1, h: 0.17, align: 'center', kind: 'band' },
  },
];

/** The layout with this id, or the first layout when the id is unknown. */
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
