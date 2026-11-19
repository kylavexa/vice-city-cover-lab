// Vice City Cover Lab — wires the editor: photos, layouts, grades, caption,
// undo/redo, panel crop and pan, and PNG export at the three post sizes.
import { LAYOUTS, GRADES, SIZES, renderCover, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('preview');
const statusEl = document.getElementById('status');
const layoutRow = document.getElementById('layouts');
const gradeRow = document.getElementById('grades');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const badgeInput = document.getElementById('badge');
const sizeSelect = document.getElementById('size');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const exportBtn = document.getElementById('export');
const exportAllBtn = document.getElementById('export-all');
const panelInfo = document.getElementById('panel-info');
const zoomSlider = document.getElementById('zoom');
const slotSelect = document.getElementById('slot');
const centerBtn = document.getElementById('center-panel');

const SAMPLES = ['boulevard', 'pier'];
const SAMPLE_LABELS = { boulevard: 'Sample · Boulevard', pier: 'Sample · Pier' };

// One photo slot: { kind: 'sample'|'upload', name, src, img }.
const state = {
  layout: 'grid4',
  grade: 'sunset',
  size: 'wide',
  title: 'NEON COAST',
  subtitle: 'Vice City',
  badge: 'EST. 2026',
  effects: { grain: true, vignette: true, halftone: true, palm: true },
  photos: [null, null, null],
  panels: null,
  selected: 0,
};

let history = [];
let future = [];
let fontsReady = false;

function defaultPanels() {
  const layout = LAYOUTS[state.layout];
  return layout.panels.map((p) => ({ slot: p.slot, zoom: 1, ox: 0, oy: 0 }));
}

function snapshot() {
  return JSON.stringify({
    layout: state.layout,
    grade: state.grade,
    size: state.size,
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    effects: state.effects,
    panels: state.panels,
    selected: state.selected,
    photos: state.photos.map((p) => (p ? { kind: p.kind, name: p.name, src: p.src } : null)),
  });
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 25) history.shift();
  future = [];
  syncUndoButtons();
}

function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, {
    layout: s.layout,
    grade: s.grade,
    size: s.size,
    title: s.title,
    subtitle: s.subtitle,
    badge: s.badge,
    effects: s.effects,
    panels: s.panels,
    selected: s.selected,
  });
  state.photos = s.photos.map(() => null);
  const loads = s.photos.map((p, i) => {
    if (!p) return Promise.resolve();
    return loadImage(p.src).then((img) => {
      state.photos[i] = { kind: p.kind, name: p.name, src: p.src, img };
    });
  });
  return Promise.all(loads).then(() => {
    syncControls();
    redraw();
  });
}

function undo() {
  if (!history.length) return;
  future.push(snapshot());
  restore(history.pop()).then(syncUndoButtons);
}

function redo() {
  if (!future.length) return;
  history.push(snapshot());
  restore(future.pop()).then(syncUndoButtons);
}

function syncUndoButtons() {
  undoBtn.disabled = history.length === 0;
  redoBtn.disabled = future.length === 0;
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  state.panels = state.panels || defaultPanels();
  renderCover(canvas, { ...state, photos: state.photos.map((p) => (p ? p.img : null)) });
  syncPanelInfo();
}

function syncPanelInfo() {
  const layout = LAYOUTS[state.layout];
  const i = state.selected;
  const t = state.panels[i];
  panelInfo.textContent = `Panel ${i + 1} of ${layout.panels.length} · ${layout.name} · photo ${String.fromCharCode(65 + t.slot)}`;
  zoomSlider.value = String(Math.round(t.zoom * 100));
  slotSelect.value = String(t.slot);
}

function syncControls() {
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  badgeInput.value = state.badge;
  sizeSelect.value = state.size;
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  document.querySelectorAll('[data-effect]').forEach((c) => {
    c.checked = !!state.effects[c.dataset.effect];
  });
  syncPanelInfo();
  syncUndoButtons();
}

function buildPickers() {
  Object.entries(LAYOUTS).forEach(([key, layout]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick layout-pick';
    b.dataset.layout = key;
    b.title = layout.hint;
    b.innerHTML = `<span class="pick-name">${layout.name}</span><span class="pick-hint">${layout.hint}</span>`;
    b.addEventListener('click', () => {
      if (state.layout === key) return;
      pushHistory();
      state.layout = key;
      state.panels = defaultPanels();
      state.selected = 0;
      syncControls();
      redraw();
    });
    layoutRow.appendChild(b);
  });
  Object.entries(GRADES).forEach(([key, grade]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick grade-pick';
    b.dataset.grade = key;
    b.title = grade.name;
    b.innerHTML = `<span class="swatch" style="background:linear-gradient(135deg,${grade.glow},${grade.hue} 55%,${grade.deep})"></span><span class="pick-name">${grade.name}</span>`;
    b.addEventListener('click', () => {
      if (state.grade === key) return;
      pushHistory();
      state.grade = key;
      syncControls();
      redraw();
    });
    gradeRow.appendChild(b);
  });
}

function setPhotoSlot(slot, photo) {
  state.photos[slot] = photo;
  redraw();
}

function samplePhoto(name) {
  return loadImage(`samples/${name}.jpg`).then((img) => ({
    kind: 'sample',
    name,
    src: `samples/${name}.jpg`,
    img,
  }));
}

function bindSlots() {
  document.querySelectorAll('[data-slot]').forEach((box) => {
    const slot = Number(box.dataset.slot);
    const file = box.querySelector('input[type=file]');
    const sample = box.querySelector('select');
    const label = box.querySelector('.slot-label');
    file.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      pushHistory();
      const src = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(f);
      });
      const img = await loadImage(src);
      setPhotoSlot(slot, { kind: 'upload', name: f.name, src, img });
      label.textContent = `Photo ${String.fromCharCode(65 + slot)} · ${f.name}`;
    });
    sample.addEventListener('change', async () => {
      if (!sample.value) return;
      pushHistory();
      const photo = await samplePhoto(sample.value);
      setPhotoSlot(slot, photo);
      label.textContent = `Photo ${String.fromCharCode(65 + slot)} · ${SAMPLE_LABELS[sample.value]}`;
    });
  });
}

function bindCaption() {
  [titleInput, subtitleInput, badgeInput].forEach((input, i) => {
    const key = ['title', 'subtitle', 'badge'][i];
    input.addEventListener('change', () => {
      if (state[key] === input.value) return;
      pushHistory();
      state[key] = input.value;
      redraw();
    });
    input.addEventListener('input', () => {
      state[key] = input.value;
      redraw();
    });
  });
}

function bindEffects() {
  document.querySelectorAll('[data-effect]').forEach((c) => {
    c.addEventListener('change', () => {
      pushHistory();
      state.effects[c.dataset.effect] = c.checked;
      redraw();
    });
  });
}

function bindPanelTools() {
  // The zoom snapshot is taken when the slider gains focus, before any input
  // moves it, so Undo restores the zoom from before the drag, not after it.
  let zoomSnapshotTaken = false;
  zoomSlider.addEventListener('focus', () => {
    if (!zoomSnapshotTaken) {
      pushHistory();
      zoomSnapshotTaken = true;
    }
  });
  zoomSlider.addEventListener('blur', () => {
    zoomSnapshotTaken = false;
  });
  zoomSlider.addEventListener('input', () => {
    const t = state.panels[state.selected];
    t.zoom = Number(zoomSlider.value) / 100;
    redraw();
  });
  slotSelect.addEventListener('change', () => {
    pushHistory();
    state.panels[state.selected].slot = Number(slotSelect.value);
    redraw();
  });
  centerBtn.addEventListener('click', () => {
    pushHistory();
    const t = state.panels[state.selected];
    t.zoom = 1;
    t.ox = 0;
    t.oy = 0;
    redraw();
  });

  // Drag on the preview pans the selected panel; the wheel zooms it.
  // The history snapshot is taken on pointerdown, before the pan moves
  // anything, so Undo restores the panel from before the drag.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const hit = panelAt(state, px, py, canvas.width, canvas.height);
    if (hit < 0) return;
    state.selected = hit;
    syncPanelInfo();
    const t = state.panels[hit];
    drag = { x: e.clientX, y: e.clientY, ox: t.ox, oy: t.oy };
    pushHistory();
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const t = state.panels[state.selected];
    t.ox = drag.ox + (e.clientX - drag.x) * scale;
    t.oy = drag.oy + (e.clientY - drag.y) * scale;
    redraw();
  });
  canvas.addEventListener('pointerup', () => {
    drag = null;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const t = state.panels[state.selected];
    t.zoom = Math.min(3, Math.max(0.5, t.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    redraw();
  }, { passive: false });
}

function download(canvasEl, name) {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

function renderAt(sizeKey) {
  const off = document.createElement('canvas');
  renderCover(off, { ...state, size: sizeKey, photos: state.photos.map((p) => (p ? p.img : null)) });
  return off;
}

let exporting = false;

async function exportOne(sizeKey) {
  if (exporting) return;
  exporting = true;
  exportBtn.disabled = true;
  exportAllBtn.disabled = true;
  statusEl.textContent = 'Rendering…';
  try {
    const size = SIZES[sizeKey];
    const off = renderAt(sizeKey);
    await download(off, `vice-city-cover-${size.w}x${size.h}.png`);
    statusEl.textContent = `Saved vice-city-cover-${size.w}x${size.h}.png`;
  } finally {
    exporting = false;
    exportBtn.disabled = false;
    exportAllBtn.disabled = false;
  }
}

async function exportAll() {
  if (exporting) return;
  exporting = true;
  exportBtn.disabled = true;
  exportAllBtn.disabled = true;
  statusEl.textContent = 'Rendering all three sizes…';
  try {
    for (const key of Object.keys(SIZES)) {
      const size = SIZES[key];
      const off = renderAt(key);
      await download(off, `vice-city-cover-${size.w}x${size.h}.png`);
      await new Promise((r) => setTimeout(r, 350));
    }
    statusEl.textContent = 'Saved all three sizes.';
  } finally {
    exporting = false;
    exportBtn.disabled = false;
    exportAllBtn.disabled = false;
  }
}

async function loadFonts() {
  if (!document.fonts) return;
  const faces = [
    new FontFace('Anton', 'url(fonts/Anton-Regular.ttf)'),
    new FontFace('Pacifico', 'url(fonts/Pacifico-Regular.ttf)'),
    new FontFace('Bebas Neue', "url(fonts/BebasNeue-Regular.ttf)"),
  ];
  await Promise.all(faces.map(async (f) => {
    await f.load();
    document.fonts.add(f);
  }));
  fontsReady = true;
}

async function init() {
  buildPickers();
  bindSlots();
  bindCaption();
  bindEffects();
  bindPanelTools();
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  exportBtn.addEventListener('click', () => exportOne(state.size));
  exportAllBtn.addEventListener('click', exportAll);
  sizeSelect.addEventListener('change', () => {
    pushHistory();
    state.size = sizeSelect.value;
    redraw();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
  });
  state.panels = defaultPanels();
  syncControls();
  // Load the two sample photos into slots A and B so the cover is alive at once.
  const [a, b] = await Promise.all([samplePhoto('boulevard'), samplePhoto('pier')]);
  state.photos[0] = a;
  state.photos[1] = b;
  try {
    await loadFonts();
  } catch (err) {
    statusEl.textContent = 'Fonts fell back to system fonts.';
  }
  redraw();

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, state, { renderCover, SIZES, loadImage, samplePhoto, syncControls });
  }
}

init();
