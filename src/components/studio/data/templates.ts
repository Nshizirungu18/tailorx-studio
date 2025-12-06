import { GarmentTemplate, BrushPreset } from '../types';

export const garmentTemplates: GarmentTemplate[] = [
  // Croquis
  { id: 'croquis-front', name: 'Croquis Front', category: 'croquis', thumbnail: '👤' },
  { id: 'croquis-back', name: 'Croquis Back', category: 'croquis', thumbnail: '👤' },
  { id: 'croquis-side', name: 'Croquis Side', category: 'croquis', thumbnail: '👤' },
  { id: 'croquis-pose', name: 'Fashion Pose', category: 'croquis', thumbnail: '💃' },
  
  // Tops
  { id: 'tshirt-basic', name: 'Basic T-Shirt', category: 'tops', thumbnail: '👕' },
  { id: 'blouse', name: 'Blouse', category: 'tops', thumbnail: '👚' },
  { id: 'crop-top', name: 'Crop Top', category: 'tops', thumbnail: '👙' },
  { id: 'tank-top', name: 'Tank Top', category: 'tops', thumbnail: '🎽' },
  { id: 'button-shirt', name: 'Button-Up Shirt', category: 'tops', thumbnail: '👔' },
  
  // Dresses
  { id: 'a-line-dress', name: 'A-Line Dress', category: 'dresses', thumbnail: '👗' },
  { id: 'sheath-dress', name: 'Sheath Dress', category: 'dresses', thumbnail: '👗' },
  { id: 'maxi-dress', name: 'Maxi Dress', category: 'dresses', thumbnail: '👗' },
  { id: 'mini-dress', name: 'Mini Dress', category: 'dresses', thumbnail: '👗' },
  { id: 'wrap-dress', name: 'Wrap Dress', category: 'dresses', thumbnail: '👗' },
  
  // Pants
  { id: 'slim-pants', name: 'Slim Pants', category: 'pants', thumbnail: '👖' },
  { id: 'wide-leg', name: 'Wide Leg Pants', category: 'pants', thumbnail: '👖' },
  { id: 'shorts', name: 'Shorts', category: 'pants', thumbnail: '🩳' },
  { id: 'skirt-a-line', name: 'A-Line Skirt', category: 'pants', thumbnail: '🩱' },
  { id: 'pencil-skirt', name: 'Pencil Skirt', category: 'pants', thumbnail: '🩱' },
  
  // Outerwear
  { id: 'blazer', name: 'Blazer', category: 'outerwear', thumbnail: '🧥' },
  { id: 'coat', name: 'Coat', category: 'outerwear', thumbnail: '🧥' },
  { id: 'bomber', name: 'Bomber Jacket', category: 'outerwear', thumbnail: '🧥' },
  { id: 'cardigan', name: 'Cardigan', category: 'outerwear', thumbnail: '🧶' },
  
  // Accessories
  { id: 'bag-tote', name: 'Tote Bag', category: 'accessories', thumbnail: '👜' },
  { id: 'bag-clutch', name: 'Clutch', category: 'accessories', thumbnail: '👛' },
  { id: 'scarf', name: 'Scarf', category: 'accessories', thumbnail: '🧣' },
  { id: 'hat', name: 'Hat', category: 'accessories', thumbnail: '🎩' },
];

export const brushPresets: BrushPreset[] = [
  // Pencil brushes
  { id: 'pencil-fine', name: 'Fine Pencil', type: 'pencil', size: 1, opacity: 100, hardness: 100 },
  { id: 'pencil-sketch', name: 'Sketch Pencil', type: 'pencil', size: 3, opacity: 80, hardness: 70 },
  { id: 'pencil-soft', name: 'Soft Pencil', type: 'pencil', size: 5, opacity: 60, hardness: 30 },
  
  // Brush types
  { id: 'brush-round', name: 'Round Brush', type: 'brush', size: 10, opacity: 100, hardness: 80 },
  { id: 'brush-flat', name: 'Flat Brush', type: 'brush', size: 15, opacity: 100, hardness: 100 },
  { id: 'brush-soft', name: 'Soft Brush', type: 'brush', size: 20, opacity: 70, hardness: 20 },
  { id: 'brush-calligraphy', name: 'Calligraphy', type: 'brush', size: 8, opacity: 100, hardness: 100 },
  
  // Airbrush
  { id: 'airbrush-soft', name: 'Soft Airbrush', type: 'airbrush', size: 30, opacity: 30, hardness: 0 },
  { id: 'airbrush-medium', name: 'Medium Airbrush', type: 'airbrush', size: 50, opacity: 50, hardness: 10 },
  { id: 'airbrush-detail', name: 'Detail Airbrush', type: 'airbrush', size: 15, opacity: 40, hardness: 5 },
  
  // Texture brushes
  { id: 'texture-linen', name: 'Linen Texture', type: 'texture', size: 40, opacity: 60, hardness: 50 },
  { id: 'texture-denim', name: 'Denim Texture', type: 'texture', size: 35, opacity: 70, hardness: 60 },
  { id: 'texture-silk', name: 'Silk Texture', type: 'texture', size: 45, opacity: 40, hardness: 20 },
  { id: 'texture-leather', name: 'Leather Texture', type: 'texture', size: 30, opacity: 80, hardness: 70 },
  
  // Pattern brushes
  { id: 'pattern-dots', name: 'Polka Dots', type: 'pattern', size: 20, opacity: 100, hardness: 100 },
  { id: 'pattern-stripes', name: 'Stripes', type: 'pattern', size: 25, opacity: 100, hardness: 100 },
  { id: 'pattern-floral', name: 'Floral', type: 'pattern', size: 50, opacity: 90, hardness: 80 },
];

export const templateCategories = [
  { id: 'croquis', name: 'Croquis', icon: '👤' },
  { id: 'tops', name: 'Tops', icon: '👕' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'pants', name: 'Pants & Skirts', icon: '👖' },
  { id: 'outerwear', name: 'Outerwear', icon: '🧥' },
  { id: 'accessories', name: 'Accessories', icon: '👜' },
];
