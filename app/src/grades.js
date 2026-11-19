// Colour grades for the cover. `sky` is the background gradient (top, middle,
// bottom). `wash` tints each photo. `accent` draws panel borders and the
// badge. `ink` is the title text, `paper` the title block, `glow` the title's
// halo. `mono` grades draw every photo in full grayscale.

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    sky: ['#ff9a3d', '#ff5e7a', '#7b2f8b'],
    wash: 'rgba(255, 90, 60, 0.16)',
    accent: '#ffd166',
    ink: '#fff7e6',
    paper: '#1b1030',
    glow: '#ff7a3d',
    mono: false,
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    sky: ['#0d0221', '#3b0a6e', '#ff2e88'],
    wash: 'rgba(255, 46, 136, 0.2)',
    accent: '#00e5ff',
    ink: '#ffffff',
    paper: '#0d0221',
    glow: '#ff2e88',
    mono: false,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    sky: ['#ffd76a', '#ff9e3d', '#c65d21'],
    wash: 'rgba(255, 180, 60, 0.16)',
    accent: '#7b2f8b',
    ink: '#2b1608',
    paper: '#fff3d6',
    glow: '#ffb03d',
    mono: false,
  },
  {
    id: 'palm-dusk',
    name: 'Palm Dusk',
    sky: ['#1f6f8b', '#3a506b', '#1c2541'],
    wash: 'rgba(60, 140, 180, 0.18)',
    accent: '#ff8c42',
    ink: '#eaf6ff',
    paper: '#101828',
    glow: '#4cc9f0',
    mono: false,
  },
  {
    id: 'heat-haze',
    name: 'Heat Haze',
    sky: ['#ff3b30', '#ff7a18', '#7a0c02'],
    wash: 'rgba(255, 60, 40, 0.2)',
    accent: '#ffe66d',
    ink: '#fff3e0',
    paper: '#2b0500',
    glow: '#ff5a1f',
    mono: false,
  },
  {
    id: 'aqua-vice',
    name: 'Aqua Vice',
    sky: ['#00c2a8', '#0096c7', '#023e8a'],
    wash: 'rgba(0, 180, 200, 0.16)',
    accent: '#ff6b9d',
    ink: '#eafcff',
    paper: '#022b3a',
    glow: '#00e5c7',
    mono: false,
  },
  {
    id: 'sunbleach',
    name: 'Sunbleach',
    sky: ['#f7ead7', '#f2c9a0', '#d9a066'],
    wash: 'rgba(255, 240, 210, 0.1)',
    accent: '#b5651d',
    ink: '#4a2c14',
    paper: '#fdf6ec',
    glow: '#f2c9a0',
    mono: false,
  },
  {
    id: 'mono-chrome',
    name: 'Mono Chrome',
    sky: ['#e8e8e8', '#9a9a9a', '#222222'],
    wash: 'rgba(0, 0, 0, 0)',
    accent: '#ffffff',
    ink: '#ffffff',
    paper: '#111111',
    glow: '#cccccc',
    mono: true,
  },
];

/** The grade with this id, or the first grade when the id is unknown. */
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

/** One-line descriptions, shown as tooltips on the grade swatches. */
export const GRADE_BLURBS = {
  'vice-sunset': 'Orange, pink and purple — the classic Vice City sunset',
  'neon-nights': 'Magenta and cyan neon on a dark night sky',
  'golden-hour': 'Warm gold and amber, late-afternoon light',
  'palm-dusk': 'Teal and dusk purple, cool evening palms',
  'heat-haze': 'Hot reds and oranges, high-noon haze',
  'aqua-vice': 'Aqua and deep blue, ocean-side Vice',
  'sunbleach': 'Pale washed-out pastels, sun-faded print',
  'mono-chrome': 'Full grayscale, every photo in black and white',
};
