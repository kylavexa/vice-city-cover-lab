// Fixed scenes for screenshots: ?shot=cover draws one exported cover alone,
// ?shot=editor shows the editor with a photo loaded, ?shot=portrait and
// ?shot=square draw the other export sizes. window.__shotReady is set once
// the scene has painted, so the screenshot runner knows when to capture.
import { LAYOUTS, SIZES } from './cover.js';

export async function runShot(shot, query, state, lib) {
  const { renderCover } = lib;
  const canvas = document.getElementById('preview');
  const caption = query.get('caption') ?? 'Neon Coast';
  const layout = query.get('layout') ?? state.layout;
  const grade = query.get('grade') ?? state.grade;

  // The shot owns the caption and the layout for its scene.
  state.title = caption;
  state.subtitle = query.get('subtitle') ?? 'Vice City';
  state.badge = query.get('badge') ?? 'EST. 2026';
  state.layout = layout;
  state.grade = grade;
  const { loadImage, samplePhoto } = lib;
  const [a, b] = await Promise.all([samplePhoto('boulevard'), samplePhoto('pier')]);
  state.photos[0] = a;
  state.photos[1] = b;
  // Slot C reuses the boulevard sample, cropped differently per panel, so
  // every panel of every scene holds a photo.
  if (query.get('photo2')) {
    const extra = await loadImage(`samples/${query.get('photo2')}.jpg`);
    state.photos[2] = { kind: 'sample', name: query.get('photo2'), src: `samples/${query.get('photo2')}.jpg`, img: extra };
  } else {
    state.photos[2] = a;
  }
  // The size is fixed by the scene, then the panel crops are varied so a
  // repeated photo never looks identical.
  if (shot === 'editor') {
    document.body.classList.remove('shot-cover');
    state.size = 'wide';
  } else {
    document.body.classList.add('shot-cover');
    if (shot === 'portrait') state.size = 'story';
    else if (shot === 'square') state.size = 'square';
    else state.size = 'wide';
  }
  const dims = SIZES[state.size] || SIZES.wide;
  state.panels = LAYOUTS[state.layout].panels.map((p, i) => ({
    slot: p.slot,
    zoom: 1 + (i % 3) * 0.18,
    ox: (i % 2 ? -1 : 1) * dims.w * 0.02,
    oy: 0,
  }));
  // Keep the editor's buttons in step with the scene's state, so a shot of
  // the editor shows the layout and grade it actually rendered with.
  if (lib.syncControls) lib.syncControls();

  const paint = () => {
    renderCover(canvas, { ...state, photos: state.photos.map((p) => (p ? p.img : null)) });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  };

  paint();
}
