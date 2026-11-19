// Vice City Cover Lab — the cover engine: draws a multi-panel GTA-style poster
// onto a canvas at any export size. Layouts, colour grades, halftone title
// blocks, grain and vignette are all drawn here; main.js owns the UI state.

export const LAYOUTS = {
  grid4: {
    name: 'Sunset Grid',
    hint: 'Hero left, three stacked right',
    panels: [
      { x: 0.03, y: 0.04, w: 0.58, h: 0.92, slot: 0 },
      { x: 0.63, y: 0.04, w: 0.34, h: 0.29, slot: 1 },
      { x: 0.63, y: 0.355, w: 0.34, h: 0.29, slot: 2 },
      { x: 0.63, y: 0.67, w: 0.34, h: 0.29, slot: 0 },
    ],
    title: { x: 0.03, y: 0.78, w: 0.58, h: 0.18, align: 'left' },
  },
  hero: {
    name: 'Hero Bleed',
    hint: 'One photo, full bleed, title band',
    panels: [{ x: 0.0, y: 0.0, w: 1.0, h: 1.0, slot: 0 }],
    title: { x: 0.05, y: 0.66, w: 0.9, h: 0.28, align: 'left' },
  },
  tilted: {
    name: 'Tilted Snapshots',
    hint: 'Three tilted prints on a sunset sky',
    panels: [
      { x: 0.06, y: 0.30, w: 0.40, h: 0.46, slot: 0, rot: -6 },
      { x: 0.33, y: 0.22, w: 0.40, h: 0.46, slot: 1, rot: 2 },
      { x: 0.58, y: 0.32, w: 0.38, h: 0.46, slot: 2, rot: 6 },
    ],
    title: { x: 0.05, y: 0.04, w: 0.9, h: 0.16, align: 'center' },
    sky: true,
  },
  triptych: {
    name: 'Neon Strip',
    hint: 'Three tall panels, story ready',
    panels: [
      { x: 0.03, y: 0.04, w: 0.303, h: 0.72, slot: 0 },
      { x: 0.348, y: 0.04, w: 0.303, h: 0.72, slot: 1 },
      { x: 0.667, y: 0.04, w: 0.303, h: 0.72, slot: 2 },
    ],
    title: { x: 0.05, y: 0.79, w: 0.9, h: 0.17, align: 'center' },
  },
  nine: {
    name: 'Nine-Panel Grid',
    hint: 'Three by three contact sheet',
    panels: [
      { x: 0.03, y: 0.04, w: 0.303, h: 0.29, slot: 0 },
      { x: 0.348, y: 0.04, w: 0.303, h: 0.29, slot: 1 },
      { x: 0.667, y: 0.04, w: 0.303, h: 0.29, slot: 2 },
      { x: 0.03, y: 0.345, w: 0.303, h: 0.29, slot: 1 },
      { x: 0.348, y: 0.345, w: 0.303, h: 0.29, slot: 2 },
      { x: 0.667, y: 0.345, w: 0.303, h: 0.29, slot: 0 },
      { x: 0.03, y: 0.65, w: 0.303, h: 0.29, slot: 2 },
      { x: 0.348, y: 0.65, w: 0.303, h: 0.29, slot: 0 },
      { x: 0.667, y: 0.65, w: 0.303, h: 0.29, slot: 1 },
    ],
    title: { x: 0.05, y: 0.955, w: 0.9, h: 0.04, align: 'center', small: true },
  },
  duo: {
    name: 'Duo Split',
    hint: 'Two halves, title bar below',
    panels: [
      { x: 0.03, y: 0.04, w: 0.465, h: 0.68, slot: 0 },
      { x: 0.505, y: 0.04, w: 0.465, h: 0.68, slot: 1 },
    ],
    title: { x: 0.05, y: 0.75, w: 0.9, h: 0.2, align: 'center' },
  },
  frame: {
    name: 'Poster Frame',
    hint: 'One photo in a white frame',
    panels: [{ x: 0.08, y: 0.05, w: 0.84, h: 0.62, slot: 0 }],
    title: { x: 0.08, y: 0.70, w: 0.84, h: 0.24, align: 'center' },
    frame: true,
  },
  boulevard: {
    name: 'Boulevard',
    hint: 'Hero on top, three small below',
    panels: [
      { x: 0.03, y: 0.04, w: 0.94, h: 0.52, slot: 0 },
      { x: 0.03, y: 0.58, w: 0.303, h: 0.36, slot: 1 },
      { x: 0.348, y: 0.58, w: 0.303, h: 0.36, slot: 2 },
      { x: 0.667, y: 0.58, w: 0.303, h: 0.36, slot: 0 },
    ],
    title: { x: 0.05, y: 0.44, w: 0.9, h: 0.12, align: 'left' },
  },
};

export const GRADES = {
  sunset: { name: 'Vice Sunset', hue: '#ff5e3a', deep: '#7b1e5b', glow: '#ffb347', sky: ['#2b1055', '#7597de'] },
  neon: { name: 'Neon Nights', hue: '#00e5ff', deep: '#12003a', glow: '#ff2e88', sky: ['#0b0033', '#3d0a5e'] },
  golden: { name: 'Golden Hour', hue: '#ffb347', deep: '#8a3b12', glow: '#ffe29a', sky: ['#3d1e0a', '#c97b2d'] },
  dusk: { name: 'Palm Dusk', hue: '#b388ff', deep: '#1c1445', glow: '#ff8fb3', sky: ['#160f33', '#5b2a86'] },
  heat: { name: 'Heat Haze', hue: '#ff2e2e', deep: '#4a0a0a', glow: '#ff7a18', sky: ['#2b0a1e', '#8a1f2d'] },
  aqua: { name: 'Aqua Vice', hue: '#2affd5', deep: '#003b46', glow: '#a5fff0', sky: ['#02283b', '#0a6e6e'] },
  bleach: { name: 'Sunbleach', hue: '#ffd9ec', deep: '#6e5570', glow: '#ffffff', sky: ['#8a7a9e', '#e8b4c8'] },
  mono: { name: 'Mono Chrome', hue: '#e8e8e8', deep: '#111111', glow: '#ffffff', sky: ['#0d0d0d', '#4a4a4a'], desat: 0.85 },
};

export const SIZES = {
  square: { name: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  story: { name: 'Story · 1080 × 1350', w: 1080, h: 1350 },
  wide: { name: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
};

// A small noise tile, made once, reused for the grain pass.
let grainTile = null;
function makeGrainTile() {
  if (grainTile) return grainTile;
  grainTile = document.createElement('canvas');
  grainTile.width = 128;
  grainTile.height = 128;
  const g = grainTile.getContext('2d');
  const data = g.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(Math.random() * 64);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return grainTile;
}

/** Draws an image cover-fitting a rect, with a zoom and a pan offset. */
function drawFitted(ctx, img, x, y, w, h, zoom, ox, oy) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - pw) / 2 + ox, y + (h - ph) / 2 + oy, pw, ph);
}

/** Washes a rect with a grade: a hue veil, then a soft-light gradient. */
function gradeWash(ctx, x, y, w, h, grade) {
  ctx.save();
  if (grade.desat) {
    // A grey 'saturation' wash pulls the colour out before the tone goes on.
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = grade.desat;
    ctx.fillStyle = '#808080';
    ctx.fillRect(x, y, w, h);
  }
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = grade.hue;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.8;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, grade.glow);
  g.addColorStop(1, grade.deep);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** A field of halftone dots, biggest at the left, fading right. */
function drawHalftone(ctx, x, y, w, h, color, gap, maxR) {
  ctx.save();
  ctx.fillStyle = color;
  const cols = Math.floor(w / gap);
  const rows = Math.floor(h / gap);
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const t = 1 - c / Math.max(1, cols);
      const rad = Math.max(0.4, maxR * (0.25 + 0.75 * t));
      ctx.beginPath();
      ctx.arc(x + c * gap + gap / 2, y + r * gap + gap / 2, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A simple stylised palm silhouette: trunk plus seven fronds. */
function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -52, 34, -88);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = (-168 + i * 26) * (Math.PI / 180);
    const tx = 34 + Math.cos(a) * 52;
    const ty = -88 + Math.sin(a) * 30 + 12;
    ctx.beginPath();
    ctx.moveTo(34, -88);
    ctx.quadraticCurveTo(34 + Math.cos(a) * 30, -88 + Math.sin(a) * 22 - 14, tx, ty);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(30, -84, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Fits a one-line title into a width, shrinking until it fits. */
function fitFont(ctx, text, font, maxW, start) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

/** The title block: halftone band, gradient Anton title, neon Pacifico subtitle, badge. */
function drawTitleBlock(ctx, zone, state, W, H) {
  const grade = GRADES[state.grade];
  const x = zone.x * W;
  const y = zone.y * H;
  const w = zone.w * W;
  const h = zone.h * H;
  const title = (state.title || 'NEON COAST').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const badge = (state.badge || '').trim();
  const align = zone.align || 'left';
  const cx = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  if (state.effects.halftone) {
    ctx.globalAlpha = 0.5;
    drawHalftone(ctx, x, y, w, Math.min(h * 0.32, 46), grade.glow, Math.max(9, h * 0.09), Math.max(2.4, h * 0.035));
    ctx.globalAlpha = 1;
  }
  // The badge rides in a strip at the top of the zone; the title and the
  // subtitle live below it, so nothing ever overlaps.
  const showBadge = !!badge && h >= 64 && !zone.small;
  const bSize = showBadge ? Math.max(12, h * 0.15) : 0;
  const badgeH = showBadge ? bSize * 1.5 + h * 0.06 : 0;
  const bodyTop = y + badgeH;
  const bodyH = h - badgeH;
  // Title in Anton, sunset gradient fill, dark outline.
  const size = fitFont(ctx, title, (s) => `${s}px Anton, 'Arial Black', sans-serif`, w, zone.small ? h * 0.62 : bodyH * (sub ? 0.6 : 0.85));
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, '#fff7ae');
  grad.addColorStop(0.45, grade.glow);
  grad.addColorStop(1, grade.hue);
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  ctx.textAlign = align;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = Math.max(2, size * 0.09);
  const ty = bodyTop + size * 0.95;
  ctx.strokeText(title, cx, ty);
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, ty);
  // Subtitle in Pacifico, neon glow.
  if (sub) {
    const sSize = fitFont(ctx, sub, (s) => `${s}px Pacifico, cursive`, w * 0.9, bodyH * 0.3);
    ctx.font = `${sSize}px Pacifico, cursive`;
    ctx.shadowColor = grade.hue;
    ctx.shadowBlur = Math.max(6, sSize * 0.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sub, cx, ty + sSize * 1.05);
    ctx.shadowBlur = 0;
  }
  // Badge ribbon in Bebas Neue, top strip of the zone.
  if (showBadge) {
    ctx.font = `${bSize}px 'Bebas Neue', sans-serif`;
    const bw = ctx.measureText(badge.toUpperCase()).width + bSize * 1.4;
    const bx = align === 'center' ? cx - bw / 2 : align === 'right' ? x + w - bw : x;
    const by = y + h * 0.02;
    ctx.fillStyle = 'rgba(22, 10, 36, 0.85)';
    ctx.fillRect(bx, by, bw, bSize * 1.5);
    ctx.strokeStyle = grade.glow;
    ctx.lineWidth = Math.max(1.5, bSize * 0.08);
    ctx.strokeRect(bx, by, bw, bSize * 1.5);
    ctx.fillStyle = grade.glow;
    ctx.textAlign = 'center';
    ctx.fillText(badge.toUpperCase(), bx + bw / 2, by + bSize * 1.12);
  }
  ctx.restore();
}

/** Draws one panel: photo (or placeholder), grade wash, white edge, shadow. */
function drawPanel(ctx, panel, transform, photo, grade, W, H, gutter) {
  const x = panel.x * W;
  const y = panel.y * H;
  const w = panel.w * W;
  const h = panel.h * H;
  ctx.save();
  if (panel.rot) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((panel.rot * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
  } else {
    ctx.translate(x, y);
  }
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.max(6, W * 0.012);
  ctx.shadowOffsetY = Math.max(3, W * 0.006);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-gutter / 2, -gutter / 2, w + gutter, h + gutter);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  if (photo) {
    drawFitted(ctx, photo, 0, 0, w, h, transform.zoom, transform.ox, transform.oy);
    gradeWash(ctx, 0, 0, w, h, grade);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, grade.sky[0]);
    g.addColorStop(1, grade.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `600 ${Math.max(13, w * 0.045)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', w / 2, h / 2);
  }
  ctx.restore();
}

/** Draws the whole cover for a state onto a canvas of the export size. */
export function renderCover(canvas, state) {
  const size = SIZES[state.size] || SIZES.square;
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const W = size.w;
  const H = size.h;
  const layout = LAYOUTS[state.layout] || LAYOUTS.grid4;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const gutter = Math.max(4, W * 0.008);

  // Backdrop: sunset sky, or a deep frame colour for the framed layout.
  if (layout.sky || layout.frame) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, grade.sky[0]);
    sky.addColorStop(0.55, grade.deep);
    sky.addColorStop(1, grade.hue);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    if (layout.sky) {
      ctx.fillStyle = 'rgba(255, 214, 130, 0.9)';
      ctx.beginPath();
      ctx.arc(W * 0.78, H * 0.16, W * 0.075, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#160a24';
    ctx.fillRect(0, 0, W, H);
  }
  if (layout.frame) {
    ctx.fillStyle = '#f6f1e7';
    ctx.fillRect(W * 0.03, H * 0.025, W * 0.94, H * 0.95);
  }

  // Panels, in order.
  layout.panels.forEach((panel, i) => {
    const t = (state.panels && state.panels[i]) || { slot: panel.slot, zoom: 1, ox: 0, oy: 0 };
    const photo = state.photos ? state.photos[t.slot] || null : null;
    drawPanel(ctx, panel, t, photo, grade, W, H, gutter);
  });

  // Palm silhouettes for the sky layouts.
  if (state.effects.palm && layout.sky) {
    drawPalm(ctx, W * 0.04, H * 0.97, W * 0.0011, 'rgba(22, 8, 32, 0.85)');
    drawPalm(ctx, W * 0.94, H * 0.99, W * 0.0008, 'rgba(22, 8, 32, 0.7)');
  }

  // Title block on top.
  drawTitleBlock(ctx, layout.title, state, W, H);

  // Grain, then vignette.
  if (state.effects.grain) {
    const tile = makeGrainTile();
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'overlay';
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (state.effects.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0, 0, 0, 0)');
    v.addColorStop(1, 'rgba(10, 2, 20, 0.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
  return canvas;
}

/** Which panel (if any) holds a point, in canvas pixels. */
export function panelAt(state, px, py, W, H) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.grid4;
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (px >= p.x * W && px <= (p.x + p.w) * W && py >= p.y * H && py <= (p.y + p.h) * H) return i;
  }
  return -1;
}
