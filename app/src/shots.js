// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo; ?shot=cover shows the cover alone. The query picks the sample
// (`photo`), the words (`caption`), the export size (`size`), the layout
// (`layout`) and the grade (`grade`). window.__shotReady is set once painted.

import { EXPORT_SIZES } from './state.js';

export async function runShot(shot, query, setup) {
  const sizeId = query.get('size') ?? '1080x1080';
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) ?? EXPORT_SIZES[0];
  const layout = query.get('layout') ?? 'sunset-grid';
  const grade = query.get('grade') ?? 'vice-sunset';
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const kicker = query.get('kicker') ?? 'A Vice City Story';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await setup({
    size,
    layout,
    grade,
    photo: `samples/${photo}.jpg`,
    caption,
    kicker,
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
