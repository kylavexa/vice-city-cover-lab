// Wires the page: photo slots, layout and grade pickers, caption, export,
// undo/redo, and panel editing (click to pick a panel, drag to pan its
// photo, wheel to zoom). A `?shot=` query sets up a fixed scene for a
// screenshot instead (./shots.js).
import { drawCover, renderCover } from './cover.js';
import { LAYOUTS } from './layouts.js';
import { GRADES, GRADE_BLURBS } from './grades.js';
import { createState, createHistory, pushHistory, undoState, redoState, resetPanel, EXPORT_SIZES } from './state.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const kickerInput = document.getElementById('kicker');
const statusEl = document.getElementById('status');
const state = createState();
const hist = createHistory();
let fontsReady = false;
let dragging = null;
let wheelTimer = null;

/** Loads the three vendored fonts before the first paint. */
async function ensureFonts() {
  if (fontsReady) return;
  try {
    await Promise.all([
      document.fonts.load('900 100px Anton'),
      document.fonts.load('700 40px "Bebas Neue"'),
      document.fonts.load('40px Pacifico'),
    ]);
    await document.fonts.ready;
  } catch {
    // The cover still draws with fallback fonts.
  }
  fontsReady = true;
}

function currentSize() {
  return EXPORT_SIZES.find((s) => s.id === state.sizeId) ?? EXPORT_SIZES[0];
}

function panelKey(i) {
  return `${state.layoutId}:${i}`;
}

function panelTransform(i) {
  return state.transforms[panelKey(i)] ?? { zoom: 1, dx: 0, dy: 0 };
}

function redraw() {
  const size = currentSize();
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
  syncControls();
}

/** Marks the active layout, grade, size and panel in the controls. */
function syncControls() {
  document.querySelectorAll('#layout-pick button').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === state.layoutId);
  });
  document.querySelectorAll('#grade-pick button').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === state.gradeId);
  });
  document.querySelectorAll('#size-pick button').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === state.sizeId);
  });
  document.getElementById('panel-photo').value = String(
    state.photoOf[panelKey(state.selectedPanel)] ?? 0,
  );
  document.getElementById('zoom').value = String(panelTransform(state.selectedPanel).zoom);
  document.getElementById('undo').disabled = hist.past.length === 0;
  document.getElementById('redo').disabled = hist.future.length === 0;
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

/** Builds the layout, grade and size pickers from the tables. */
function buildPickers() {
  const layoutPick = document.getElementById('layout-pick');
  for (const l of LAYOUTS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = l.id;
    b.textContent = l.name;
    b.addEventListener('click', () => {
      if (state.layoutId === l.id) return;
      pushHistory(hist, state);
      state.layoutId = l.id;
      state.selectedPanel = 0;
      redraw();
    });
    layoutPick.appendChild(b);
  }
  const gradePick = document.getElementById('grade-pick');
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = g.id;
    b.title = `${g.name} — ${GRADE_BLURBS[g.id] ?? ''}`;
    b.setAttribute('aria-label', g.name);
    b.style.background = `linear-gradient(135deg, ${g.sky[0]}, ${g.sky[1]} 55%, ${g.sky[2]})`;
    b.addEventListener('click', () => {
      if (state.gradeId === g.id) return;
      pushHistory(hist, state);
      state.gradeId = g.id;
      redraw();
    });
    gradePick.appendChild(b);
  }
  const sizePick = document.getElementById('size-pick');
  for (const s of EXPORT_SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = s.id;
    b.textContent = s.label;
    b.addEventListener('click', () => {
      if (state.sizeId === s.id) return;
      pushHistory(hist, state);
      state.sizeId = s.id;
      redraw();
    });
    sizePick.appendChild(b);
  }
}

/** Builds the three photo slots: upload, or one of the two samples. */
function buildSlots() {
  const slots = document.getElementById('slots');
  for (let slot = 0; slot < 3; slot++) {
    const card = document.createElement('div');
    card.className = 'slot';
    card.innerHTML = `<strong>Photo ${slot + 1}</strong>
      <label class="upload">Upload <input type="file" accept="image/*" hidden></label>
      <span class="slot-name">empty</span>`;
    const input = card.querySelector('input');
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      pushHistory(hist, state);
      state.photos[slot] = await loadImage(URL.createObjectURL(file));
      card.querySelector('.slot-name').textContent = file.name.slice(0, 18);
      redraw();
    });
    for (const sample of ['pier', 'boulevard']) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sample';
      b.textContent = sample;
      b.addEventListener('click', async () => {
        pushHistory(hist, state);
        state.photos[slot] = await loadImage(`samples/${sample}.jpg`);
        card.querySelector('.slot-name').textContent = `${sample} (sample)`;
        redraw();
      });
      card.appendChild(b);
    }
    slots.appendChild(card);
  }
}

/** The panel under a canvas point (canvas pixels), topmost first. */
function hitPanel(x, y) {
  const { layoutId } = state;
  const W = canvas.width;
  const H = canvas.height;
  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    const cx = (p.x + p.w / 2) * W;
    const cy = (p.y + p.h / 2) * H;
    let dx = x - cx;
    let dy = y - cy;
    if (p.rot) {
      const a = (-p.rot * Math.PI) / 180;
      const rx = dx * Math.cos(a) - dy * Math.sin(a);
      const ry = dx * Math.sin(a) + dy * Math.cos(a);
      dx = rx;
      dy = ry;
    }
    if (Math.abs(dx) <= (p.w * W) / 2 && Math.abs(dy) <= (p.h * H) / 2) return i;
  }
  return -1;
}

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

canvas.addEventListener('pointerdown', (e) => {
  const pt = canvasPoint(e);
  const i = hitPanel(pt.x, pt.y);
  if (i < 0) return;
  pushHistory(hist, state);
  state.selectedPanel = i;
  const layout = LAYOUTS.find((l) => l.id === state.layoutId) ?? LAYOUTS[0];
  const p = layout.panels[i];
  dragging = { panel: i, startX: pt.x, startY: pt.y, pw: p.w * canvas.width, ph: p.h * canvas.height };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const pt = canvasPoint(e);
  const t = { ...panelTransform(dragging.panel) };
  t.dx = Math.max(-0.6, Math.min(0.6, t.dx + (pt.x - dragging.startX) / dragging.pw));
  t.dy = Math.max(-0.6, Math.min(0.6, t.dy + (pt.y - dragging.startY) / dragging.ph));
  dragging.startX = pt.x;
  dragging.startY = pt.y;
  state.transforms[panelKey(dragging.panel)] = t;
  redraw();
});

canvas.addEventListener('pointerup', () => {
  dragging = null;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const i = state.selectedPanel;
  const t = { ...panelTransform(i) };
  t.zoom = Math.max(1, Math.min(4, t.zoom * Math.exp(-e.deltaY * 0.0012)));
  state.transforms[panelKey(i)] = t;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => pushHistory(hist, state), 400);
  redraw();
}, { passive: false });

document.getElementById('panel-photo').addEventListener('change', (e) => {
  pushHistory(hist, state);
  state.photoOf[panelKey(state.selectedPanel)] = Number(e.target.value);
  redraw();
});

document.getElementById('zoom').addEventListener('input', (e) => {
  const t = { ...panelTransform(state.selectedPanel) };
  t.zoom = Number(e.target.value);
  state.transforms[panelKey(state.selectedPanel)] = t;
  redraw();
});

document.getElementById('zoom').addEventListener('change', () => {
  pushHistory(hist, state);
});

document.getElementById('zoom-reset').addEventListener('click', () => {
  pushHistory(hist, state);
  resetPanel(state, panelKey(state.selectedPanel));
  redraw();
});

captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
captionInput.addEventListener('change', () => pushHistory(hist, state));
kickerInput.addEventListener('input', () => {
  state.kicker = kickerInput.value;
  redraw();
});
kickerInput.addEventListener('change', () => pushHistory(hist, state));

document.getElementById('undo').addEventListener('click', () => {
  if (undoState(hist, state)) {
    captionInput.value = state.caption;
    kickerInput.value = state.kicker;
    redraw();
  }
});
document.getElementById('redo').addEventListener('click', () => {
  if (redoState(hist, state)) {
    captionInput.value = state.caption;
    kickerInput.value = state.kicker;
    redraw();
  }
});

/** Downloads a canvas as a PNG file. */
function downloadCanvas(c, name) {
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

document.getElementById('export').addEventListener('click', () => {
  const size = currentSize();
  downloadCanvas(renderCover(size.w, size.h, state), `cover-${size.id}.png`);
  statusEl.textContent = `Saved cover-${size.id}.png`;
});

document.getElementById('export-all').addEventListener('click', () => {
  EXPORT_SIZES.forEach((size, i) => {
    setTimeout(() => {
      downloadCanvas(renderCover(size.w, size.h, state), `cover-${size.id}.png`);
    }, i * 350);
  });
  statusEl.textContent = 'Saved all 3 sizes';
});

buildPickers();
buildSlots();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (scene) => {
    state.layoutId = scene.layout;
    state.gradeId = scene.grade;
    state.caption = scene.caption;
    state.kicker = scene.kicker;
    state.sizeId = scene.size.id;
    const img = await loadImage(scene.photo);
    state.photos[0] = img;
    state.photos[1] = img;
    state.photos[2] = img;
    const sampleName = `${scene.photo.split('/').pop().replace('.jpg', '')} (sample)`;
    document.querySelectorAll('.slot-name').forEach((el) => {
      el.textContent = sampleName;
    });
    captionInput.value = scene.caption;
    await ensureFonts();
    redraw();
  });
} else {
  (async () => {
    state.photos[0] = await loadImage('samples/pier.jpg');
    state.photos[1] = await loadImage('samples/boulevard.jpg');
    state.photos[2] = state.photos[0];
    document.querySelectorAll('.slot-name')[0].textContent = 'pier (sample)';
    document.querySelectorAll('.slot-name')[1].textContent = 'boulevard (sample)';
    document.querySelectorAll('.slot-name')[2].textContent = 'pier (sample)';
    await ensureFonts();
    redraw();
  })();
}
