// Draws a GTA-style cover onto a canvas from the editor state. The state
// carries the layout id, grade id, caption, kicker, the three photo slots
// (Image objects or null) and per-panel overrides: which slot a panel shows
// and its zoom/pan. Everything is drawn from the layout and grade tables,
// so the same state always paints the same cover.

import { layoutById } from './layouts.js';
import { gradeById } from './grades.js';

/** A tiny deterministic PRNG, so grain looks the same on every export. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable seed from the words that make a cover. */
function seedOf(...words) {
  let h = 2166136261;
  for (const w of words) {
    for (let i = 0; i < w.length; i++) {
      h ^= w.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

/** Draws `img` into the rect with cover-fit, zoom and pan. `dx`/`dy` are
 * fractions of the rect. Mono grades draw the photo in full grayscale. */
function drawPhotoCover(ctx, img, x, y, w, h, zoom, dx, dy, mono) {
  if (!img) return;
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const s = base * zoom;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const cx = x + w / 2 + dx * w;
  const cy = y + h / 2 + dy * h;
  ctx.save();
  if (mono) ctx.filter = 'grayscale(1)';
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

/** Halftone dots over a rect: dots grow toward the edges, comic-print style. */
function halftone(ctx, x, y, w, h, color, spacing) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const maxD = Math.hypot(w, h) / 2;
  ctx.fillStyle = color;
  for (let py = y + spacing / 2; py < y + h; py += spacing) {
    for (let px = x + spacing / 2; px < x + w; px += spacing) {
      const d = Math.hypot(px - cx, py - cy) / maxD;
      const r = Math.max(0.4, spacing * 0.22 * (0.35 + d));
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** One palm silhouette: a curved trunk and seven drooping fronds. */
function palmTree(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk, leaning slightly.
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -52, 22, -92);
  ctx.stroke();
  // Fronds from the crown.
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i * 0.84) / 6);
    const tx = 22 + Math.cos(a) * 52;
    const ty = -92 + Math.sin(a) * 30;
    const mx = 22 + Math.cos(a) * 30;
    const my = -92 + Math.sin(a) * 6 - 14;
    ctx.beginPath();
    ctx.moveTo(22, -92);
    ctx.quadraticCurveTo(mx, my, tx, ty + 16);
    ctx.stroke();
  }
  ctx.restore();
}

/** Film grain: seeded specks over the whole cover, same every time. */
function grain(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  const n = Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    const s = 1 + rand() * 2;
    ctx.fillRect(rand() * w, rand() * h, s, s);
  }
  ctx.restore();
}

/** A soft darkening toward the edges. */
function vignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Fits one line of text into a width, shrinking from `start` size. */
function fitFont(ctx, text, font, start, maxWidth, min) {
  let size = start;
  ctx.font = font(size);
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = font(size);
  }
  return size;
}

/** The caption block: kicker, big title, and a script flourish. */
function titleBlock(ctx, zone, caption, kicker, grade, W, H) {
  const x = zone.x * W;
  const y = zone.y * H;
  const w = zone.w * W;
  const h = zone.h * H;
  const cx = x + w / 2;
  ctx.save();
  if (zone.kind === 'band' || zone.kind === 'ribbon' || zone.kind === 'header') {
    ctx.fillStyle = grade.paper;
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.globalAlpha = 0.16;
    halftone(ctx, x, y, w, h, grade.accent, Math.max(10, W / 96));
    ctx.restore();
    ctx.fillStyle = grade.accent;
    ctx.fillRect(x, y, w, Math.max(3, H * 0.004));
    ctx.fillRect(x, y + h - Math.max(3, H * 0.004), w, Math.max(3, H * 0.004));
  } else {
    const scrim = ctx.createLinearGradient(0, y, 0, y + h);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = scrim;
    ctx.fillRect(x, y, w, h);
  }
  const text = (caption || 'Sunset Heist').trim().toUpperCase() || 'SUNSET HEIST';
  const kick = (kicker || 'A VICE CITY STORY').trim().toUpperCase();
  const alignX = zone.align === 'left' ? x + w * 0.06 : cx;
  ctx.textAlign = zone.align === 'left' ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  // Over a photo the words need light ink; on a paper block they use the
  // grade's own ink and accent.
  const overPhoto = zone.kind === 'overlay';
  const kickColor = overPhoto ? '#ffffff' : grade.accent;
  const ink = overPhoto ? '#ffffff' : grade.ink;
  const scriptColor = overPhoto ? '#ffffff' : grade.accent;
  // Kicker in Bebas Neue, letterspaced and fitted to the zone so it never
  // spills past the edges (letter spacing is counted by hand: measureText
  // does not always include it).
  let kickSize = Math.max(10, h * 0.16);
  const kickWidth = (s) => {
    ctx.font = `${s}px 'Bebas Neue', sans-serif`;
    return ctx.measureText(kick).width + kick.length * Math.max(2, s * 0.22);
  };
  while (kickSize > 10 && kickWidth(kickSize) > w * 0.92) kickSize *= 0.94;
  ctx.font = `${kickSize}px 'Bebas Neue', sans-serif`;
  try {
    ctx.letterSpacing = `${Math.max(2, kickSize * 0.22)}px`;
  } catch {
    // Older browsers ignore letterSpacing; the text still draws.
  }
  ctx.fillStyle = kickColor;
  ctx.fillText(kick, alignX, y + h * (zone.notitle ? 0.34 : 0.2));
  try {
    ctx.letterSpacing = '0px';
  } catch {
    // Ignore.
  }
  // Title in Anton, fitted to the zone. Zones marked notitle (the framed
  // layout's footer) show only the kicker and the script flourish.
  if (!zone.notitle) {
    const titleSize = fitFont(
      ctx,
      text,
      (s) => `900 ${s}px Anton, 'Arial Narrow', sans-serif`,
      h * 0.46,
      w * 0.92,
      12,
    );
    ctx.font = `900 ${titleSize}px Anton, 'Arial Narrow', sans-serif`;
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = titleSize * 0.28;
    ctx.fillStyle = ink;
    ctx.fillText(text, alignX, y + h * 0.56);
    ctx.shadowBlur = 0;
  }
  // Script flourish in Pacifico.
  const scriptSize = Math.max(10, h * 0.17);
  ctx.font = `${scriptSize}px Pacifico, cursive`;
  ctx.fillStyle = scriptColor;
  ctx.fillText('Vice City', alignX, y + h * (zone.notitle ? 0.68 : 0.86));
  ctx.restore();
}

/** A small diagonal ribbon in the top-right corner. */
function badgeRibbon(ctx, W, H, grade) {
  const bw = W * 0.24;
  const bh = Math.max(18, H * 0.035);
  ctx.save();
  ctx.translate(W - bw * 0.42, bh * 0.9);
  ctx.rotate(0.12);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = grade.paper;
  ctx.font = `700 ${bh * 0.52}px 'Bebas Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try {
    ctx.letterSpacing = `${bh * 0.12}px`;
  } catch {
    // Ignore.
  }
  ctx.fillText('VICE CITY', 0, bh * 0.03);
  ctx.restore();
}

/** Draws the whole cover onto `canvas` (its own width/height) from state. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Palms in the bottom corners, behind the panels: they show where the
  // sky is bare and hide behind panels and title blocks elsewhere.
  ctx.save();
  ctx.globalAlpha = 0.42;
  palmTree(ctx, W * 0.04, H * 0.99, H * 0.0022, 'rgba(20,8,30,0.85)');
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.scale(-1, 1);
  palmTree(ctx, -W * 0.96, H * 0.99, H * 0.0022, 'rgba(20,8,30,0.85)');
  ctx.restore();
  // Panels.
  layout.panels.forEach((panel, i) => {
    const key = `${state.layoutId}:${i}`;
    const slot = state.photoOf[key] ?? panel.photo;
    const t = state.transforms[key] ?? { zoom: 1, dx: 0, dy: 0 };
    const px = panel.x * W;
    const py = panel.y * H;
    const pw = panel.w * W;
    const ph = panel.h * H;
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    if (panel.rot) ctx.rotate((panel.rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
    // Drop shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(4, 6, pw, ph);
    ctx.beginPath();
    ctx.rect(0, 0, pw, ph);
    ctx.clip();
    const img = state.photos[slot] ?? null;
    if (img) {
      drawPhotoCover(ctx, img, 0, 0, pw, ph, t.zoom, t.dx, t.dy, grade.mono);
    } else {
      ctx.fillStyle = grade.paper;
      ctx.fillRect(0, 0, pw, ph);
      ctx.fillStyle = grade.accent;
      ctx.font = `${Math.max(12, ph * 0.08)}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD A PHOTO', pw / 2, ph / 2);
    }
    if (!grade.mono) {
      ctx.fillStyle = grade.wash;
      ctx.fillRect(0, 0, pw, ph);
    }
    ctx.restore();
    // Border, drawn unrotated around the panel's box for a clean frame.
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    if (panel.rot) ctx.rotate((panel.rot * Math.PI) / 180);
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  });
  // Title block (and footer, for the framed layout).
  titleBlock(ctx, layout.title, state.caption, state.kicker, grade, W, H);
  if (layout.footer) {
    titleBlock(ctx, layout.footer, state.caption, state.kicker, grade, W, H);
  }
  badgeRibbon(ctx, W, H, grade);
  grain(ctx, W, H, seedOf(state.layoutId, state.gradeId, state.caption, String(W), String(H)));
  vignette(ctx, W, H);
}

/** Renders the cover at an exact size into a fresh canvas (for export). */
export function renderCover(width, height, state) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
