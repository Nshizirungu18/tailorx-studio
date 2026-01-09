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
  // ========== CROQUIS ==========
  'croquis-front': {
    id: 'croquis-front',
    name: 'Croquis Front',
    viewBox: '0 0 120 400',
    width: 120,
    height: 400,
    regions: [
      { id: 'head', name: 'Head', pathData: 'M45 10 Q60 5 75 10 Q85 25 85 40 Q85 55 75 65 Q60 75 45 65 Q35 55 35 40 Q35 25 45 10 Z', defaultColor: '#fce4d6' },
      { id: 'torso', name: 'Torso', pathData: 'M40 75 L80 75 L85 90 L90 180 L85 180 L75 180 L60 185 L45 180 L35 180 L30 180 L35 90 Z', defaultColor: '#fce4d6' },
      { id: 'left-arm', name: 'Left Arm', pathData: 'M35 90 L25 95 L15 150 L10 200 L20 202 L28 155 L35 110 Z', defaultColor: '#fce4d6' },
      { id: 'right-arm', name: 'Right Arm', pathData: 'M85 90 L95 95 L105 150 L110 200 L100 202 L92 155 L85 110 Z', defaultColor: '#fce4d6' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M45 180 L38 250 L35 330 L32 385 L48 385 L50 330 L52 250 L55 185 Z', defaultColor: '#fce4d6' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M75 180 L82 250 L85 330 L88 385 L72 385 L70 330 L68 250 L65 185 Z', defaultColor: '#fce4d6' }
    ]
  },
  'croquis-back': {
    id: 'croquis-back',
    name: 'Croquis Back',
    viewBox: '0 0 120 400',
    width: 120,
    height: 400,
    regions: [
      { id: 'head', name: 'Head', pathData: 'M45 10 Q60 5 75 10 Q85 25 85 40 Q85 55 75 65 Q60 75 45 65 Q35 55 35 40 Q35 25 45 10 Z', defaultColor: '#fce4d6' },
      { id: 'back', name: 'Back', pathData: 'M40 75 L80 75 L85 90 L88 180 L32 180 L35 90 Z', defaultColor: '#fce4d6' },
      { id: 'left-arm', name: 'Left Arm', pathData: 'M35 90 L25 95 L15 150 L10 200 L20 202 L28 155 L35 110 Z', defaultColor: '#fce4d6' },
      { id: 'right-arm', name: 'Right Arm', pathData: 'M85 90 L95 95 L105 150 L110 200 L100 202 L92 155 L85 110 Z', defaultColor: '#fce4d6' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M45 180 L38 250 L35 330 L32 385 L48 385 L50 330 L52 250 L55 185 Z', defaultColor: '#fce4d6' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M75 180 L82 250 L85 330 L88 385 L72 385 L70 330 L68 250 L65 185 Z', defaultColor: '#fce4d6' }
    ]
  },
  'croquis-side': {
    id: 'croquis-side',
    name: 'Croquis Side',
    viewBox: '0 0 100 400',
    width: 100,
    height: 400,
    regions: [
      { id: 'head', name: 'Head', pathData: 'M35 10 Q55 5 60 20 Q65 35 60 50 Q55 65 40 65 Q25 60 25 40 Q25 20 35 10 Z', defaultColor: '#fce4d6' },
      { id: 'torso', name: 'Torso', pathData: 'M40 70 L55 75 L60 100 L55 180 L35 180 L30 100 L35 75 Z', defaultColor: '#fce4d6' },
      { id: 'arm', name: 'Arm', pathData: 'M55 85 L65 90 L70 140 L65 195 L55 195 L52 140 Z', defaultColor: '#fce4d6' },
      { id: 'left-leg', name: 'Front Leg', pathData: 'M45 180 L50 250 L48 330 L45 385 L35 385 L38 330 L40 250 Z', defaultColor: '#fce4d6' },
      { id: 'right-leg', name: 'Back Leg', pathData: 'M40 185 L35 250 L32 330 L30 385 L20 385 L25 330 L28 250 Z', defaultColor: '#fce4d6' }
    ]
  },
  'croquis-pose': {
    id: 'croquis-pose',
    name: 'Fashion Pose',
    viewBox: '0 0 140 400',
    width: 140,
    height: 400,
    regions: [
      { id: 'head', name: 'Head', pathData: 'M55 10 Q70 5 80 15 Q88 30 85 45 Q80 60 65 65 Q50 65 45 50 Q40 35 45 20 Q50 10 55 10 Z', defaultColor: '#fce4d6' },
      { id: 'torso', name: 'Torso', pathData: 'M50 70 L85 75 L90 95 L85 175 L45 180 L40 95 Z', defaultColor: '#fce4d6' },
      { id: 'left-arm', name: 'Left Arm', pathData: 'M45 85 L30 100 L15 130 L25 170 L35 165 L40 130 L48 105 Z', defaultColor: '#fce4d6' },
      { id: 'right-arm', name: 'Right Arm', pathData: 'M88 85 L100 75 L120 85 L125 95 L115 100 L100 90 L90 95 Z', defaultColor: '#fce4d6' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M55 180 L45 250 L35 320 L25 385 L40 385 L50 320 L58 250 L62 185 Z', defaultColor: '#fce4d6' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M70 180 L85 240 L100 300 L110 385 L95 385 L85 300 L72 240 L68 185 Z', defaultColor: '#fce4d6' }
    ]
  },

  // ========== TOPS ==========
  'tshirt-basic': {
    id: 'tshirt-basic',
    name: 'Basic T-Shirt',
    viewBox: '0 0 200 250',
    width: 200,
    height: 250,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M50 70 L50 230 L150 230 L150 70 L130 50 L100 40 L70 50 Z', defaultColor: '#f5f5f5' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M50 70 L70 50 L70 55 L20 80 L15 100 L45 95 L50 70 Z', defaultColor: '#e8e8e8' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M150 70 L130 50 L130 55 L180 80 L185 100 L155 95 L150 70 Z', defaultColor: '#e8e8e8' },
      { id: 'neckline', name: 'Neckline', pathData: 'M70 50 Q100 60 130 50 Q100 35 70 50', defaultColor: '#ffffff' }
    ]
  },
  'blouse': {
    id: 'blouse',
    name: 'Blouse',
    viewBox: '0 0 200 280',
    width: 200,
    height: 280,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M55 80 L55 260 L145 260 L145 80 L125 55 L100 45 L75 55 Z', defaultColor: '#f8f8f8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M55 80 L75 55 L70 60 L15 90 L10 150 L25 155 L50 100 L55 80 Z', defaultColor: '#f0f0f0' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M145 80 L125 55 L130 60 L185 90 L190 150 L175 155 L150 100 L145 80 Z', defaultColor: '#f0f0f0' },
      { id: 'collar-left', name: 'Left Collar', pathData: 'M75 55 L100 45 L95 55 L80 70 L75 55 Z', defaultColor: '#ffffff' },
      { id: 'collar-right', name: 'Right Collar', pathData: 'M125 55 L100 45 L105 55 L120 70 L125 55 Z', defaultColor: '#ffffff' }
    ]
  },
  'crop-top': {
    id: 'crop-top',
    name: 'Crop Top',
    viewBox: '0 0 180 150',
    width: 180,
    height: 150,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M40 50 L40 140 L140 140 L140 50 L120 30 L90 20 L60 30 Z', defaultColor: '#f5f5f5' },
      { id: 'left-strap', name: 'Left Strap', pathData: 'M60 30 L50 10 L55 8 L70 25 Z', defaultColor: '#e8e8e8' },
      { id: 'right-strap', name: 'Right Strap', pathData: 'M120 30 L130 10 L125 8 L110 25 Z', defaultColor: '#e8e8e8' },
      { id: 'neckline', name: 'Neckline', pathData: 'M60 30 Q90 45 120 30 Q90 20 60 30', defaultColor: '#ffffff' }
    ]
  },
  'tank-top': {
    id: 'tank-top',
    name: 'Tank Top',
    viewBox: '0 0 160 220',
    width: 160,
    height: 220,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M35 55 L35 200 L125 200 L125 55 L110 35 L80 25 L50 35 Z', defaultColor: '#f5f5f5' },
      { id: 'left-strap', name: 'Left Strap', pathData: 'M50 35 L40 15 L48 12 L58 30 Z', defaultColor: '#e8e8e8' },
      { id: 'right-strap', name: 'Right Strap', pathData: 'M110 35 L120 15 L112 12 L102 30 Z', defaultColor: '#e8e8e8' },
      { id: 'neckline', name: 'Neckline', pathData: 'M50 35 Q80 50 110 35 Q80 25 50 35', defaultColor: '#ffffff' }
    ]
  },
  'button-shirt': {
    id: 'button-shirt',
    name: 'Button-Up Shirt',
    viewBox: '0 0 200 300',
    width: 200,
    height: 300,
    regions: [
      { id: 'left-panel', name: 'Left Panel', pathData: 'M50 75 L50 280 L95 280 L95 75 L85 50 L65 55 Z', defaultColor: '#f5f5f5' },
      { id: 'right-panel', name: 'Right Panel', pathData: 'M105 75 L105 280 L150 280 L150 75 L135 55 L115 50 Z', defaultColor: '#f5f5f5' },
      { id: 'placket', name: 'Placket', pathData: 'M95 75 L95 280 L105 280 L105 75 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M50 75 L65 55 L60 60 L10 85 L5 180 L25 185 L45 100 Z', defaultColor: '#f0f0f0' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M150 75 L135 55 L140 60 L190 85 L195 180 L175 185 L155 100 Z', defaultColor: '#f0f0f0' },
      { id: 'collar-left', name: 'Left Collar', pathData: 'M65 55 L100 40 L95 52 L75 65 Z', defaultColor: '#ffffff' },
      { id: 'collar-right', name: 'Right Collar', pathData: 'M135 55 L100 40 L105 52 L125 65 Z', defaultColor: '#ffffff' }
    ]
  },

  // ========== DRESSES ==========
  'a-line-dress': {
    id: 'a-line-dress',
    name: 'A-Line Dress',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      { id: 'bodice', name: 'Bodice', pathData: 'M60 50 L80 40 L100 35 L120 40 L140 50 L150 80 L145 120 L55 120 L50 80 Z', defaultColor: '#f5f5f5' },
      { id: 'skirt', name: 'Skirt', pathData: 'M55 120 L145 120 L170 350 L30 350 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M50 50 L35 55 L25 90 L40 95 L50 80 Z', defaultColor: '#f0f0f0' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M150 50 L165 55 L175 90 L160 95 L150 80 Z', defaultColor: '#f0f0f0' },
      { id: 'neckline', name: 'Neckline', pathData: 'M80 40 Q100 50 120 40 Q100 30 80 40', defaultColor: '#ffffff' }
    ]
  },
  'sheath-dress': {
    id: 'sheath-dress',
    name: 'Sheath Dress',
    viewBox: '0 0 180 400',
    width: 180,
    height: 400,
    regions: [
      { id: 'bodice', name: 'Bodice', pathData: 'M50 45 L70 35 L90 30 L110 35 L130 45 L135 75 L132 130 L48 130 L45 75 Z', defaultColor: '#f5f5f5' },
      { id: 'skirt', name: 'Skirt', pathData: 'M48 130 L132 130 L140 370 L40 370 Z', defaultColor: '#e8e8e8' },
      { id: 'neckline', name: 'Neckline', pathData: 'M70 35 Q90 45 110 35 Q90 25 70 35', defaultColor: '#ffffff' }
    ]
  },
  'maxi-dress': {
    id: 'maxi-dress',
    name: 'Maxi Dress',
    viewBox: '0 0 200 450',
    width: 200,
    height: 450,
    regions: [
      { id: 'bodice', name: 'Bodice', pathData: 'M55 50 L75 40 L100 35 L125 40 L145 50 L150 80 L148 130 L52 130 L50 80 Z', defaultColor: '#f5f5f5' },
      { id: 'waist', name: 'Waist', pathData: 'M52 130 L148 130 L150 160 L50 160 Z', defaultColor: '#e0e0e0' },
      { id: 'skirt', name: 'Skirt', pathData: 'M50 160 L150 160 L180 430 L20 430 Z', defaultColor: '#e8e8e8' },
      { id: 'left-strap', name: 'Left Strap', pathData: 'M75 40 L65 15 L72 12 L82 35 Z', defaultColor: '#f0f0f0' },
      { id: 'right-strap', name: 'Right Strap', pathData: 'M125 40 L135 15 L128 12 L118 35 Z', defaultColor: '#f0f0f0' }
    ]
  },
  'mini-dress': {
    id: 'mini-dress',
    name: 'Mini Dress',
    viewBox: '0 0 180 280',
    width: 180,
    height: 280,
    regions: [
      { id: 'bodice', name: 'Bodice', pathData: 'M45 50 L65 40 L90 35 L115 40 L135 50 L140 80 L138 120 L42 120 L40 80 Z', defaultColor: '#f5f5f5' },
      { id: 'skirt', name: 'Skirt', pathData: 'M42 120 L138 120 L155 260 L25 260 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M40 55 L28 60 L20 90 L32 95 L42 78 Z', defaultColor: '#f0f0f0' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M140 55 L152 60 L160 90 L148 95 L138 78 Z', defaultColor: '#f0f0f0' },
      { id: 'neckline', name: 'Neckline', pathData: 'M65 40 Q90 52 115 40 Q90 28 65 40', defaultColor: '#ffffff' }
    ]
  },
  'wrap-dress': {
    id: 'wrap-dress',
    name: 'Wrap Dress',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      { id: 'left-wrap', name: 'Left Wrap', pathData: 'M60 50 L90 45 L100 60 L100 350 L30 350 L45 120 Z', defaultColor: '#f5f5f5' },
      { id: 'right-wrap', name: 'Right Wrap', pathData: 'M140 50 L110 45 L100 60 L100 350 L170 350 L155 120 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M60 50 L45 55 L25 100 L40 105 L55 70 Z', defaultColor: '#f0f0f0' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M140 50 L155 55 L175 100 L160 105 L145 70 Z', defaultColor: '#f0f0f0' },
      { id: 'belt', name: 'Belt', pathData: 'M45 115 L155 115 L155 130 L45 130 Z', defaultColor: '#d0d0d0' }
    ]
  },

  // ========== PANTS & SKIRTS ==========
  'slim-pants': {
    id: 'slim-pants',
    name: 'Slim Pants',
    viewBox: '0 0 180 400',
    width: 180,
    height: 400,
    regions: [
      { id: 'waistband', name: 'Waistband', pathData: 'M30 20 L150 20 L155 50 L25 50 Z', defaultColor: '#e0e0e0' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M25 50 L90 50 L90 100 L85 380 L35 380 L30 100 Z', defaultColor: '#f5f5f5' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M90 50 L155 50 L150 100 L145 380 L95 380 L90 100 Z', defaultColor: '#f5f5f5' }
    ]
  },
  'wide-leg': {
    id: 'wide-leg',
    name: 'Wide Leg Pants',
    viewBox: '0 0 200 400',
    width: 200,
    height: 400,
    regions: [
      { id: 'waistband', name: 'Waistband', pathData: 'M40 20 L160 20 L165 50 L35 50 Z', defaultColor: '#e0e0e0' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M35 50 L100 50 L100 100 L110 380 L10 380 L30 100 Z', defaultColor: '#f5f5f5' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M100 50 L165 50 L170 100 L190 380 L90 380 L100 100 Z', defaultColor: '#f5f5f5' }
    ]
  },
  'shorts': {
    id: 'shorts',
    name: 'Shorts',
    viewBox: '0 0 180 180',
    width: 180,
    height: 180,
    regions: [
      { id: 'waistband', name: 'Waistband', pathData: 'M30 20 L150 20 L155 45 L25 45 Z', defaultColor: '#e0e0e0' },
      { id: 'left-leg', name: 'Left Leg', pathData: 'M25 45 L90 45 L90 70 L95 160 L25 160 L30 70 Z', defaultColor: '#f5f5f5' },
      { id: 'right-leg', name: 'Right Leg', pathData: 'M90 45 L155 45 L150 70 L155 160 L85 160 L90 70 Z', defaultColor: '#f5f5f5' }
    ]
  },
  'skirt-a-line': {
    id: 'skirt-a-line',
    name: 'A-Line Skirt',
    viewBox: '0 0 200 250',
    width: 200,
    height: 250,
    regions: [
      { id: 'waistband', name: 'Waistband', pathData: 'M50 20 L150 20 L155 45 L45 45 Z', defaultColor: '#e0e0e0' },
      { id: 'skirt-body', name: 'Skirt', pathData: 'M45 45 L155 45 L180 230 L20 230 Z', defaultColor: '#f5f5f5' }
    ]
  },
  'pencil-skirt': {
    id: 'pencil-skirt',
    name: 'Pencil Skirt',
    viewBox: '0 0 160 280',
    width: 160,
    height: 280,
    regions: [
      { id: 'waistband', name: 'Waistband', pathData: 'M35 20 L125 20 L130 45 L30 45 Z', defaultColor: '#e0e0e0' },
      { id: 'skirt-body', name: 'Skirt', pathData: 'M30 45 L130 45 L125 260 L35 260 Z', defaultColor: '#f5f5f5' },
      { id: 'back-slit', name: 'Back Slit', pathData: 'M75 220 L85 220 L85 260 L75 260 Z', defaultColor: '#e8e8e8' }
    ]
  },

  // ========== OUTERWEAR ==========
  'blazer': {
    id: 'blazer',
    name: 'Blazer',
    viewBox: '0 0 220 320',
    width: 220,
    height: 320,
    regions: [
      { id: 'left-panel', name: 'Left Panel', pathData: 'M55 75 L55 300 L100 300 L100 75 L85 50 L65 55 Z', defaultColor: '#f0f0f0' },
      { id: 'right-panel', name: 'Right Panel', pathData: 'M120 75 L120 300 L165 300 L165 75 L155 55 L135 50 Z', defaultColor: '#f0f0f0' },
      { id: 'left-lapel', name: 'Left Lapel', pathData: 'M85 50 L100 75 L100 140 L90 130 L80 70 L85 50 Z', defaultColor: '#e8e8e8' },
      { id: 'right-lapel', name: 'Right Lapel', pathData: 'M135 50 L120 75 L120 140 L130 130 L140 70 L135 50 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M55 75 L65 55 L55 60 L10 85 L5 280 L30 285 L50 100 Z', defaultColor: '#f5f5f5' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M165 75 L155 55 L165 60 L210 85 L215 280 L190 285 L170 100 Z', defaultColor: '#f5f5f5' },
      { id: 'collar', name: 'Collar', pathData: 'M85 50 L100 35 L110 30 L120 35 L135 50 Q110 40 85 50', defaultColor: '#ffffff' }
    ]
  },
  'coat': {
    id: 'coat',
    name: 'Coat',
    viewBox: '0 0 240 400',
    width: 240,
    height: 400,
    regions: [
      { id: 'left-panel', name: 'Left Panel', pathData: 'M55 80 L55 380 L110 380 L110 80 L95 55 L70 60 Z', defaultColor: '#f0f0f0' },
      { id: 'right-panel', name: 'Right Panel', pathData: 'M130 80 L130 380 L185 380 L185 80 L170 60 L145 55 Z', defaultColor: '#f0f0f0' },
      { id: 'left-lapel', name: 'Left Lapel', pathData: 'M95 55 L110 80 L110 160 L98 150 L88 75 Z', defaultColor: '#e8e8e8' },
      { id: 'right-lapel', name: 'Right Lapel', pathData: 'M145 55 L130 80 L130 160 L142 150 L152 75 Z', defaultColor: '#e8e8e8' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M55 80 L70 60 L60 65 L5 95 L0 350 L30 355 L50 120 Z', defaultColor: '#f5f5f5' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M185 80 L170 60 L180 65 L235 95 L240 350 L210 355 L190 120 Z', defaultColor: '#f5f5f5' },
      { id: 'collar', name: 'Collar', pathData: 'M95 55 L110 40 L120 35 L130 40 L145 55 Q120 45 95 55', defaultColor: '#ffffff' }
    ]
  },
  'bomber': {
    id: 'bomber',
    name: 'Bomber Jacket',
    viewBox: '0 0 220 280',
    width: 220,
    height: 280,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M50 65 L50 250 L170 250 L170 65 L150 45 L110 35 L70 45 Z', defaultColor: '#f5f5f5' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M50 65 L70 45 L65 50 L15 75 L10 230 L35 235 L48 100 Z', defaultColor: '#e8e8e8' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M170 65 L150 45 L155 50 L205 75 L210 230 L185 235 L172 100 Z', defaultColor: '#e8e8e8' },
      { id: 'collar', name: 'Collar', pathData: 'M70 45 L110 30 L150 45 L145 55 L110 42 L75 55 Z', defaultColor: '#e0e0e0' },
      { id: 'waistband', name: 'Waistband', pathData: 'M50 250 L170 250 L170 265 L50 265 Z', defaultColor: '#e0e0e0' },
      { id: 'left-cuff', name: 'Left Cuff', pathData: 'M10 230 L35 235 L35 250 L10 245 Z', defaultColor: '#e0e0e0' },
      { id: 'right-cuff', name: 'Right Cuff', pathData: 'M210 230 L185 235 L185 250 L210 245 Z', defaultColor: '#e0e0e0' }
    ]
  },
  'cardigan': {
    id: 'cardigan',
    name: 'Cardigan',
    viewBox: '0 0 220 320',
    width: 220,
    height: 320,
    regions: [
      { id: 'left-front', name: 'Left Front', pathData: 'M55 70 L55 300 L100 300 L100 70 L90 50 L68 55 Z', defaultColor: '#f5f5f5' },
      { id: 'right-front', name: 'Right Front', pathData: 'M120 70 L120 300 L165 300 L165 70 L152 55 L130 50 Z', defaultColor: '#f5f5f5' },
      { id: 'left-sleeve', name: 'Left Sleeve', pathData: 'M55 70 L68 55 L60 60 L10 85 L8 290 L32 295 L50 100 Z', defaultColor: '#e8e8e8' },
      { id: 'right-sleeve', name: 'Right Sleeve', pathData: 'M165 70 L152 55 L160 60 L210 85 L212 290 L188 295 L170 100 Z', defaultColor: '#e8e8e8' },
      { id: 'neckband', name: 'Neckband', pathData: 'M90 50 L110 40 L130 50 L125 58 L110 48 L95 58 Z', defaultColor: '#e0e0e0' }
    ]
  },

  // ========== ACCESSORIES ==========
  'bag-tote': {
    id: 'bag-tote',
    name: 'Tote Bag',
    viewBox: '0 0 180 200',
    width: 180,
    height: 200,
    regions: [
      { id: 'bag-body', name: 'Bag Body', pathData: 'M20 60 L160 60 L150 190 L30 190 Z', defaultColor: '#f5f5f5' },
      { id: 'left-handle', name: 'Left Handle', pathData: 'M45 60 L55 60 L55 20 Q50 10 45 20 Z', defaultColor: '#e0e0e0' },
      { id: 'right-handle', name: 'Right Handle', pathData: 'M125 60 L135 60 L135 20 Q130 10 125 20 Z', defaultColor: '#e0e0e0' },
      { id: 'pocket', name: 'Front Pocket', pathData: 'M55 100 L125 100 L122 150 L58 150 Z', defaultColor: '#e8e8e8' }
    ]
  },
  'bag-clutch': {
    id: 'bag-clutch',
    name: 'Clutch',
    viewBox: '0 0 200 120',
    width: 200,
    height: 120,
    regions: [
      { id: 'body', name: 'Body', pathData: 'M20 35 L180 35 L180 100 L20 100 Z', defaultColor: '#f5f5f5' },
      { id: 'flap', name: 'Flap', pathData: 'M20 35 L180 35 L180 55 L20 55 Z', defaultColor: '#e8e8e8' },
      { id: 'clasp', name: 'Clasp', pathData: 'M90 50 L110 50 L110 60 L90 60 Z', defaultColor: '#d0d0d0' }
    ]
  },
  'scarf': {
    id: 'scarf',
    name: 'Scarf',
    viewBox: '0 0 300 100',
    width: 300,
    height: 100,
    regions: [
      { id: 'main', name: 'Main Body', pathData: 'M30 30 L270 30 L275 70 L25 70 Z', defaultColor: '#f5f5f5' },
      { id: 'left-fringe', name: 'Left Fringe', pathData: 'M25 70 L30 70 L35 95 L20 95 Z M35 70 L40 70 L45 95 L30 95 Z', defaultColor: '#e8e8e8' },
      { id: 'right-fringe', name: 'Right Fringe', pathData: 'M265 70 L270 70 L275 95 L260 95 Z M255 70 L260 70 L265 95 L250 95 Z', defaultColor: '#e8e8e8' }
    ]
  },
  'hat': {
    id: 'hat',
    name: 'Hat',
    viewBox: '0 0 180 140',
    width: 180,
    height: 140,
    regions: [
      { id: 'crown', name: 'Crown', pathData: 'M50 30 Q90 10 130 30 L135 80 L45 80 Z', defaultColor: '#f5f5f5' },
      { id: 'brim', name: 'Brim', pathData: 'M20 80 L160 80 L170 100 L10 100 Z', defaultColor: '#e8e8e8' },
      { id: 'band', name: 'Band', pathData: 'M45 75 L135 75 L135 85 L45 85 Z', defaultColor: '#d0d0d0' }
    ]
  }
};

// Get SVG template by ID - all templates are now interactive
export function getSvgTemplate(templateId: string): SvgTemplate | null {
  return svgTemplates[templateId] || null;
}
