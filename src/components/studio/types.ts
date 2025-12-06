// Chromatique Studio Types

export type WorkflowStage = 'color' | 'sketch' | 'detail' | 'refine' | 'present';

export type ToolType = 
  | 'select' 
  | 'pencil' 
  | 'brush' 
  | 'airbrush'
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'line'
  | 'text' 
  | 'image'
  | 'eyedropper'
  | 'fill'
  | 'pattern';

export interface BrushPreset {
  id: string;
  name: string;
  type: 'pencil' | 'brush' | 'airbrush' | 'texture' | 'pattern';
  size: number;
  opacity: number;
  hardness: number;
  icon?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  category: 'pantone' | 'seasonal' | 'custom' | 'trending';
  season?: string;
  year?: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  type: 'layer' | 'group' | 'adjustment';
}

export interface GarmentTemplate {
  id: string;
  name: string;
  category: 'tops' | 'dresses' | 'pants' | 'outerwear' | 'accessories' | 'croquis';
  thumbnail: string;
  svgPath?: string;
}

export interface CanvasState {
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality: number;
  scale: number;
  includeBackground: boolean;
}
