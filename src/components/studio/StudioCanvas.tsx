import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, IText, FabricImage } from "fabric";
import { cn } from "@/lib/utils";
import { ToolType, BrushPreset } from "./types";

export interface CanvasHandle {
  addShape: (type: 'rectangle' | 'circle') => void;
  addText: () => void;
  addImage: (url: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  setZoom: (zoom: number) => void;
}

interface StudioCanvasProps {
  width?: number;
  height?: number;
  activeTool: ToolType;
  activeColor: string;
  brushSize: number;
  brushOpacity: number;
  showGrid: boolean;
  showGuides: boolean;
  onReady?: () => void;
}

export const StudioCanvas = forwardRef<CanvasHandle, StudioCanvasProps>(({
  width = 800,
  height = 1000,
  activeTool,
  activeColor,
  brushSize,
  brushOpacity,
  showGrid,
  showGuides,
  onReady,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
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
      selection: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    fabricRef.current = canvas;

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    historyRef.current = [initialState];
    historyIndexRef.current = 0;

    // Listen for changes
    const saveState = () => {
      if (!fabricRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(json);
      historyIndexRef.current++;
    };

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    onReady?.();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update tool settings
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const isDrawingTool = ['pencil', 'brush', 'airbrush', 'eraser'].includes(activeTool);
    canvas.isDrawingMode = isDrawingTool;

    if (isDrawingTool && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    }

    canvas.renderAll();
  }, [activeTool, activeColor, brushSize, brushOpacity]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addShape: (type: 'rectangle' | 'circle') => {
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
    },

    addText: () => {
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
    },

    addImage: (url: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      FabricImage.fromURL(url).then((img) => {
        img.scaleToWidth(200);
        img.set({ left: 100, top: 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    },

    clear: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    },

    undo: () => {
      const canvas = fabricRef.current;
      if (!canvas || historyIndexRef.current <= 0) return;

      historyIndexRef.current--;
      const json = historyRef.current[historyIndexRef.current];
      canvas.loadFromJSON(JSON.parse(json)).then(() => {
        canvas.renderAll();
      });
    },

    redo: () => {
      const canvas = fabricRef.current;
      if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;

      historyIndexRef.current++;
      const json = historyRef.current[historyIndexRef.current];
      canvas.loadFromJSON(JSON.parse(json)).then(() => {
        canvas.renderAll();
      });
    },

    exportCanvas: (format: 'png' | 'jpg' | 'svg' = 'png') => {
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
          quality: 1,
          multiplier: 2,
        });
        downloadFile(dataUrl, `chromatique-design.${format}`);
      }
    },

    setZoom: (zoom: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.setZoom(zoom / 100);
    },
  }));

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      {/* Grid Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Guides Overlay */}
      {showGuides && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={cn(
          "rounded-lg shadow-elevated",
          "touch-none" // Better stylus support
        )}
      />
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
