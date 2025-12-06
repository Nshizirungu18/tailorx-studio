import { ColorPalette } from '../types';

export const pantonePalettes: ColorPalette[] = [
  {
    id: 'pantone-2024',
    name: 'Pantone Color of the Year 2024',
    category: 'pantone',
    colors: ['#FFBE98', '#FFA07A', '#FF8B6A', '#F77F6C', '#E26B5C'],
    year: 2024
  },
  {
    id: 'pantone-classic',
    name: 'Pantone Classic Neutrals',
    category: 'pantone',
    colors: ['#F5F5F5', '#E8E8E8', '#C4C4C4', '#8B8B8B', '#2D2D2D']
  },
  {
    id: 'pantone-earth',
    name: 'Pantone Earth Tones',
    category: 'pantone',
    colors: ['#D4A574', '#B8956E', '#8B7355', '#6B5344', '#4A3728']
  }
];

export const seasonalPalettes: ColorPalette[] = [
  {
    id: 'spring-25',
    name: 'Spring/Summer 2025',
    category: 'seasonal',
    season: 'Spring/Summer',
    year: 2025,
    colors: ['#FFD1DC', '#A8E6CF', '#88D8C0', '#7FC8F8', '#FCE38A']
  },
  {
    id: 'fall-25',
    name: 'Fall/Winter 2025',
    category: 'seasonal',
    season: 'Fall/Winter',
    year: 2025,
    colors: ['#8B4513', '#2F4F4F', '#800020', '#4A4E69', '#C9B037']
  },
  {
    id: 'resort-25',
    name: 'Resort 2025',
    category: 'seasonal',
    season: 'Resort',
    year: 2025,
    colors: ['#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3']
  }
];

export const trendingPalettes: ColorPalette[] = [
  {
    id: 'quiet-luxury',
    name: 'Quiet Luxury',
    category: 'trending',
    colors: ['#F5F5DC', '#D4C4A8', '#B8A88A', '#8B7355', '#4A3728']
  },
  {
    id: 'digital-lavender',
    name: 'Digital Lavender',
    category: 'trending',
    colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#BA55D3', '#9932CC']
  },
  {
    id: 'sustainable-green',
    name: 'Sustainable Green',
    category: 'trending',
    colors: ['#90EE90', '#3CB371', '#2E8B57', '#228B22', '#006400']
  }
];

export const allPalettes = [...pantonePalettes, ...seasonalPalettes, ...trendingPalettes];

// Color harmony generators
export const generateComplementary = (hex: string): string[] => {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const complement = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  return [hex, rgbToHex(complement.r, complement.g, complement.b)];
};

export const generateAnalogous = (hex: string): string[] => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
  ];
};

export const generateTriadic = (hex: string): string[] => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
  ];
};

export const generateSplitComplementary = (hex: string): string[] => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hex,
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
  ];
};

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
