// SVG Template definitions for Chromatique Studio
// Each template has multiple fillable regions that can be colored independently

export interface TemplateRegion {
  id: string;
  name: string;
  pathData: string;
  defaultColor: string;
}

export interface SvgTemplate {
  id: string;
  name: string;
  viewBox: string;
  width: number;
  height: number;
  regions: TemplateRegion[];
}

export const svgTemplates: Record<string, SvgTemplate> = {
  // A-Line Dress
  'a-line-dress': {
    id: 'a-line-dress',
    name: 'A-Line Dress',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      {
        id: 'bodice',
        name: 'Bodice',
        pathData: 'M60 50 L80 40 L100 35 L120 40 L140 50 L150 80 L145 120 L55 120 L50 80 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'skirt',
        name: 'Skirt',
        pathData: 'M55 120 L145 120 L170 350 L30 350 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'left-sleeve',
        name: 'Left Sleeve',
        pathData: 'M50 50 L35 55 L25 90 L40 95 L50 80 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'right-sleeve',
        name: 'Right Sleeve',
        pathData: 'M150 50 L165 55 L175 90 L160 95 L150 80 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'neckline',
        name: 'Neckline',
        pathData: 'M80 40 Q100 50 120 40 Q100 30 80 40',
        defaultColor: '#ffffff'
      }
    ]
  },

  // Basic T-Shirt
  'tshirt-basic': {
    id: 'tshirt-basic',
    name: 'Basic T-Shirt',
    viewBox: '0 0 200 250',
    width: 200,
    height: 250,
    regions: [
      {
        id: 'body',
        name: 'Body',
        pathData: 'M50 70 L50 230 L150 230 L150 70 L130 50 L100 40 L70 50 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'left-sleeve',
        name: 'Left Sleeve',
        pathData: 'M50 70 L70 50 L70 55 L20 80 L15 100 L45 95 L50 70 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'right-sleeve',
        name: 'Right Sleeve',
        pathData: 'M150 70 L130 50 L130 55 L180 80 L185 100 L155 95 L150 70 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'neckline',
        name: 'Neckline',
        pathData: 'M70 50 Q100 60 130 50 Q100 35 70 50',
        defaultColor: '#ffffff'
      }
    ]
  },

  // Blouse
  'blouse': {
    id: 'blouse',
    name: 'Blouse',
    viewBox: '0 0 200 280',
    width: 200,
    height: 280,
    regions: [
      {
        id: 'body',
        name: 'Body',
        pathData: 'M55 80 L55 260 L145 260 L145 80 L125 55 L100 45 L75 55 Z',
        defaultColor: '#f8f8f8'
      },
      {
        id: 'left-sleeve',
        name: 'Left Sleeve',
        pathData: 'M55 80 L75 55 L70 60 L15 90 L10 150 L25 155 L50 100 L55 80 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'right-sleeve',
        name: 'Right Sleeve',
        pathData: 'M145 80 L125 55 L130 60 L185 90 L190 150 L175 155 L150 100 L145 80 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'collar-left',
        name: 'Left Collar',
        pathData: 'M75 55 L100 45 L95 55 L80 70 L75 55 Z',
        defaultColor: '#ffffff'
      },
      {
        id: 'collar-right',
        name: 'Right Collar',
        pathData: 'M125 55 L100 45 L105 55 L120 70 L125 55 Z',
        defaultColor: '#ffffff'
      }
    ]
  },

  // Slim Pants
  'slim-pants': {
    id: 'slim-pants',
    name: 'Slim Pants',
    viewBox: '0 0 180 400',
    width: 180,
    height: 400,
    regions: [
      {
        id: 'waistband',
        name: 'Waistband',
        pathData: 'M30 20 L150 20 L155 50 L25 50 Z',
        defaultColor: '#e0e0e0'
      },
      {
        id: 'left-leg',
        name: 'Left Leg',
        pathData: 'M25 50 L90 50 L90 100 L85 380 L35 380 L30 100 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'right-leg',
        name: 'Right Leg',
        pathData: 'M90 50 L155 50 L150 100 L145 380 L95 380 L90 100 Z',
        defaultColor: '#f5f5f5'
      }
    ]
  },

  // Wide Leg Pants
  'wide-leg': {
    id: 'wide-leg',
    name: 'Wide Leg Pants',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      {
        id: 'waistband',
        name: 'Waistband',
        pathData: 'M40 20 L160 20 L165 50 L35 50 Z',
        defaultColor: '#e0e0e0'
      },
      {
        id: 'left-leg',
        name: 'Left Leg',
        pathData: 'M35 50 L100 50 L100 100 L110 380 L10 380 L30 100 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'right-leg',
        name: 'Right Leg',
        pathData: 'M100 50 L165 50 L170 100 L190 380 L90 380 L100 100 Z',
        defaultColor: '#f5f5f5'
      }
    ]
  },

  // A-Line Skirt
  'skirt-a-line': {
    id: 'skirt-a-line',
    name: 'A-Line Skirt',
    viewBox: '0 0 200 250',
    width: 200,
    height: 250,
    regions: [
      {
        id: 'waistband',
        name: 'Waistband',
        pathData: 'M50 20 L150 20 L155 45 L45 45 Z',
        defaultColor: '#e0e0e0'
      },
      {
        id: 'skirt-body',
        name: 'Skirt',
        pathData: 'M45 45 L155 45 L180 230 L20 230 Z',
        defaultColor: '#f5f5f5'
      }
    ]
  },

  // Blazer
  'blazer': {
    id: 'blazer',
    name: 'Blazer',
    viewBox: '0 0 220 320',
    width: 220,
    height: 320,
    regions: [
      {
        id: 'left-panel',
        name: 'Left Panel',
        pathData: 'M55 75 L55 300 L100 300 L100 75 L85 50 L65 55 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'right-panel',
        name: 'Right Panel',
        pathData: 'M120 75 L120 300 L165 300 L165 75 L155 55 L135 50 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'left-lapel',
        name: 'Left Lapel',
        pathData: 'M85 50 L100 75 L100 140 L90 130 L80 70 L85 50 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'right-lapel',
        name: 'Right Lapel',
        pathData: 'M135 50 L120 75 L120 140 L130 130 L140 70 L135 50 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'left-sleeve',
        name: 'Left Sleeve',
        pathData: 'M55 75 L65 55 L55 60 L10 85 L5 280 L30 285 L50 100 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'right-sleeve',
        name: 'Right Sleeve',
        pathData: 'M165 75 L155 55 L165 60 L210 85 L215 280 L190 285 L170 100 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'collar',
        name: 'Collar',
        pathData: 'M85 50 L100 35 L110 30 L120 35 L135 50 Q110 40 85 50',
        defaultColor: '#ffffff'
      }
    ]
  },

  // Croquis Front
  'croquis-front': {
    id: 'croquis-front',
    name: 'Croquis Front',
    viewBox: '0 0 120 400',
    width: 120,
    height: 400,
    regions: [
      {
        id: 'head',
        name: 'Head',
        pathData: 'M45 10 Q60 5 75 10 Q85 25 85 40 Q85 55 75 65 Q60 75 45 65 Q35 55 35 40 Q35 25 45 10 Z',
        defaultColor: '#fce4d6'
      },
      {
        id: 'torso',
        name: 'Torso',
        pathData: 'M40 75 L80 75 L85 90 L90 180 L85 180 L75 180 L60 185 L45 180 L35 180 L30 180 L35 90 Z',
        defaultColor: '#fce4d6'
      },
      {
        id: 'left-arm',
        name: 'Left Arm',
        pathData: 'M35 90 L25 95 L15 150 L10 200 L20 202 L28 155 L35 110 Z',
        defaultColor: '#fce4d6'
      },
      {
        id: 'right-arm',
        name: 'Right Arm',
        pathData: 'M85 90 L95 95 L105 150 L110 200 L100 202 L92 155 L85 110 Z',
        defaultColor: '#fce4d6'
      },
      {
        id: 'left-leg',
        name: 'Left Leg',
        pathData: 'M45 180 L38 250 L35 330 L32 385 L48 385 L50 330 L52 250 L55 185 Z',
        defaultColor: '#fce4d6'
      },
      {
        id: 'right-leg',
        name: 'Right Leg',
        pathData: 'M75 180 L82 250 L85 330 L88 385 L72 385 L70 330 L68 250 L65 185 Z',
        defaultColor: '#fce4d6'
      }
    ]
  },

  // Wrap Dress
  'wrap-dress': {
    id: 'wrap-dress',
    name: 'Wrap Dress',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      {
        id: 'left-wrap',
        name: 'Left Wrap',
        pathData: 'M60 50 L90 45 L100 60 L100 350 L30 350 L45 120 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'right-wrap',
        name: 'Right Wrap',
        pathData: 'M140 50 L110 45 L100 60 L100 350 L170 350 L155 120 Z',
        defaultColor: '#e8e8e8'
      },
      {
        id: 'left-sleeve',
        name: 'Left Sleeve',
        pathData: 'M60 50 L45 55 L25 100 L40 105 L55 70 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'right-sleeve',
        name: 'Right Sleeve',
        pathData: 'M140 50 L155 55 L175 100 L160 105 L145 70 Z',
        defaultColor: '#f0f0f0'
      },
      {
        id: 'belt',
        name: 'Belt',
        pathData: 'M45 115 L155 115 L155 130 L45 130 Z',
        defaultColor: '#d0d0d0'
      }
    ]
  },

  // Tote Bag
  'bag-tote': {
    id: 'bag-tote',
    name: 'Tote Bag',
    viewBox: '0 0 180 200',
    width: 180,
    height: 200,
    regions: [
      {
        id: 'bag-body',
        name: 'Bag Body',
        pathData: 'M20 60 L160 60 L150 190 L30 190 Z',
        defaultColor: '#f5f5f5'
      },
      {
        id: 'left-handle',
        name: 'Left Handle',
        pathData: 'M45 60 L55 60 L55 20 Q50 10 45 20 Z',
        defaultColor: '#e0e0e0'
      },
      {
        id: 'right-handle',
        name: 'Right Handle',
        pathData: 'M125 60 L135 60 L135 20 Q130 10 125 20 Z',
        defaultColor: '#e0e0e0'
      },
      {
        id: 'pocket',
        name: 'Front Pocket',
        pathData: 'M55 100 L125 100 L122 150 L58 150 Z',
        defaultColor: '#e8e8e8'
      }
    ]
  }
};

// Get SVG template by ID, with fallback for templates without SVG data
export function getSvgTemplate(templateId: string): SvgTemplate | null {
  return svgTemplates[templateId] || null;
}
