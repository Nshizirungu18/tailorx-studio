import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, IText, FabricImage } from 'fabric';
import { ToolType, Layer, BrushPreset } from '../types';
import { toast } from 'sonner';

interface UseCanvasOptions {
  width?: number;
  height?: number;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const { width = 800, height = 1000 } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'background', name: 'Background', visible: true, locked: false, opacity: 100, blendMode: 'normal', type: 'layer' }
  ]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    // Initialize pencil brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    fabricRef.current = canvas;
    setIsReady(true);

    // Save initial state
    saveToHistory();

    // Listen for object modifications
    canvas.on('object:added', saveToHistory);
    canvas.on('object:modified', saveToHistory);
    canvas.on('object:removed', saveToHistory);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update brush settings when tool/color/size changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const isDrawingTool = ['pencil', 'brush', 'airbrush', 'eraser'].includes(activeTool);
    canvas.isDrawingMode = isDrawingTool;

    if (isDrawingTool && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : activeColor;
      canvas.freeDrawingBrush.width = brushSize;
      (canvas.freeDrawingBrush as any).opacity = brushOpacity / 100;
    }

    canvas.renderAll();
  }, [activeTool, activeColor, brushSize, brushOpacity]);

  const saveToHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    
    // Remove any redo states
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new state
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;

    historyIndexRef.current--;
    const json = historyRef.current[historyIndexRef.current];
    
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    });
  }, []);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current++;
    const json = historyRef.current[historyIndexRef.current];
    
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }, []);

  const addShape = useCallback((type: 'rectangle' | 'circle') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const shape = type === 'rectangle'
      ? new Rect({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 80,
          strokeWidth: 2,
          stroke: activeColor,
        })
      : new Circle({
          left: 100,
          top: 100,
          fill: activeColor,
          radius: 50,
          strokeWidth: 2,
          stroke: activeColor,
        });

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  }, [activeColor]);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: activeColor,
      fontFamily: 'DM Sans',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [activeColor]);

  const addImage = useCallback((url: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    FabricImage.fromURL(url).then((img) => {
      img.scaleToWidth(200);
      img.set({ left: 100, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }).catch(() => {
      toast.error('Failed to load image');
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    saveToHistory();
    toast.success('Canvas cleared');
  }, [saveToHistory]);

  const setZoomLevel = useCallback((newZoom: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const zoomFactor = newZoom / 100;
    canvas.setZoom(zoomFactor);
    setZoom(newZoom);
  }, []);

  const applyBrushPreset = useCallback((preset: BrushPreset) => {
    setBrushSize(preset.size);
    setBrushOpacity(preset.opacity);
    
    if (preset.type === 'pencil') {
      setActiveTool('pencil');
    } else if (preset.type === 'brush') {
      setActiveTool('brush');
    } else if (preset.type === 'airbrush') {
      setActiveTool('airbrush');
    }
  }, []);

  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'svg' = 'png', quality = 1) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let dataUrl: string;
    
    if (format === 'svg') {
      dataUrl = canvas.toSVG();
      const blob = new Blob([dataUrl], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `chromatique-design.svg`);
      URL.revokeObjectURL(url);
    } else {
      dataUrl = canvas.toDataURL({
        format: format === 'jpg' ? 'jpeg' : 'png',
        quality,
        multiplier: 2,
      });
      downloadFile(dataUrl, `chromatique-design.${format}`);
    }
    
    toast.success(`Design exported as ${format.toUpperCase()}`);
  }, []);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    canvasRef,
    fabricCanvas: fabricRef.current,
    isReady,
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    brushSize,
    setBrushSize,
    brushOpacity,
    setBrushOpacity,
    zoom,
    setZoomLevel,
    layers,
    setLayers,
    canUndo,
    canRedo,
    undo,
    redo,
    addShape,
    addText,
    addImage,
    clearCanvas,
    applyBrushPreset,
    exportCanvas,
  };
}
