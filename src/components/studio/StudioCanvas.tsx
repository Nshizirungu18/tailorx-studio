import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, IText, FabricImage, Path, Group, FabricObject } from "fabric";
import { cn } from "@/lib/utils";
import { ToolType } from "./types";
import { getSvgTemplate, SvgTemplate } from "./data/templateSvgs";
import { toast } from "sonner";

export interface SelectedRegion {
  templateInstanceId: string;
  regionId: string;
  regionName: string;
}

// Element tracking interface for AI access
export interface CanvasElement {
  id: string;
  type: 'template' | 'shape' | 'text' | 'image' | 'path';
  colorAreas?: Record<string, string>;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  color?: string;
  editable: boolean;
}

export interface CanvasHandle {
  addShape: (type: 'rectangle' | 'circle') => void;
  addText: () => void;
  addImage: (url: string) => void;
  addTemplate: (templateId: string) => void;
  fillSelectedRegion: (color: string) => void;
  fillRegionById: (templateId: string, regionId: string, color: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  exportCanvasDataUrl: () => string | null;
  setZoom: (zoom: number) => void;
  getSelectedRegion: () => SelectedRegion | null;
  clearRegionSelection: () => void;
  // New AI-accessible methods
  getElements: () => CanvasElement[];
  getElementById: (id: string) => CanvasElement | null;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;
  selectElement: (id: string) => void;
  selectRegion: (templateId: string, regionId: string) => void;
  setBackgroundColor: (color: string) => void;
  // Cloud save methods
  getCanvasJSON: () => object;
  loadFromJSON: (json: object) => Promise<void>;
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
  onRegionSelect?: (region: SelectedRegion | null) => void;
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
  onRegionSelect,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const selectedRegionRef = useRef<SelectedRegion | null>(null);
  const templateInstancesRef = useRef<Map<string, { group: Group; regions: Map<string, Path> }>>(new Map());

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

  // Add template to canvas
  const addTemplateToCanvas = useCallback((templateId: string) => {
    const canvas = fabricRef.current;
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    const svgTemplate = getSvgTemplate(templateId);
    if (!svgTemplate) {
      toast.info(`Template "${templateId}" - SVG not available yet`);
      return;
    }

    const instanceId = `template-${Date.now()}`;
    const regions = new Map<string, Path>();
    const pathObjects: Path[] = [];

    // Create fabric Path objects for each region
    svgTemplate.regions.forEach((region) => {
      const path = new Path(region.pathData, {
        fill: region.defaultColor,
        stroke: '#333333',
        strokeWidth: 1,
        selectable: false,
        evented: true,
        objectCaching: false,
      });

      // Store region info in a custom property
      (path as any).regionData = {
        regionId: region.id,
        regionName: region.name,
        templateInstanceId: instanceId
      };

      pathObjects.push(path);
      regions.set(region.id, path);
    });

    // Create a group from all paths
    const group = new Group(pathObjects, {
      left: (canvas.width || 800) / 2 - svgTemplate.width / 2,
      top: (canvas.height || 1000) / 2 - svgTemplate.height / 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      subTargetCheck: true,
      interactive: true,
    });

    // Store instance ID on group
    (group as any).templateInstanceId = instanceId;

    // Add click handler for region selection
    group.on('mousedown', (e) => {
      if (e.subTargets && e.subTargets.length > 0) {
        const clickedPath = e.subTargets[0] as Path;
        const data = (clickedPath as any).regionData;
        
        if (data?.regionId) {
          selectedRegionRef.current = {
            templateInstanceId: instanceId,
            regionId: data.regionId,
            regionName: data.regionName
          };

          // Highlight selected region
          regions.forEach((path, id) => {
            path.set({
              strokeWidth: id === data.regionId ? 3 : 1,
              stroke: id === data.regionId ? '#d4af37' : '#333333'
            });
          });

          group.dirty = true;
          canvas.renderAll();
          
          onRegionSelect?.(selectedRegionRef.current);
          toast.success(`Selected: ${data.regionName}`);
        }
      }
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();

    // Store template instance
    templateInstancesRef.current.set(instanceId, { group, regions });

    toast.success(`${svgTemplate.name} added to canvas - Click regions to color them`);
  }, [onRegionSelect]);

  // Fill selected region with color
  const fillRegion = useCallback((color: string) => {
    const canvas = fabricRef.current;
    const region = selectedRegionRef.current;
    
    if (!canvas || !region) {
      toast.error('Please select a region first');
      return;
    }

    const instance = templateInstancesRef.current.get(region.templateInstanceId);
    if (!instance) return;

    const path = instance.regions.get(region.regionId);
    if (!path) return;

    path.set({ fill: color });
    instance.group.dirty = true;
    canvas.renderAll();

    toast.success(`Filled ${region.regionName}`);
  }, []);

  // Clear region selection
  const clearRegionSelection = useCallback(() => {
    const canvas = fabricRef.current;
    const region = selectedRegionRef.current;
    
    if (!canvas || !region) return;

    const instance = templateInstancesRef.current.get(region.templateInstanceId);
    if (instance) {
      instance.regions.forEach((path) => {
        path.set({
          strokeWidth: 1,
          stroke: '#333333'
        });
      });
      instance.group.dirty = true;
      canvas.renderAll();
    }

    selectedRegionRef.current = null;
    onRegionSelect?.(null);
  }, [onRegionSelect]);

  // Fill region by template and region ID (AI direct access)
  const fillRegionById = useCallback((templateId: string, regionId: string, color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const instance = templateInstancesRef.current.get(templateId);
    if (!instance) {
      toast.error(`Template "${templateId}" not found`);
      return;
    }

    const path = instance.regions.get(regionId);
    if (!path) {
      toast.error(`Region "${regionId}" not found`);
      return;
    }

    path.set({ fill: color });
    instance.group.dirty = true;
    canvas.renderAll();
    toast.success(`Filled ${regionId} with ${color}`);
  }, []);

  // Get all elements on canvas
  const getElements = useCallback((): CanvasElement[] => {
    const canvas = fabricRef.current;
    if (!canvas) return [];

    const elements: CanvasElement[] = [];

    // Add template instances
    templateInstancesRef.current.forEach((instance, id) => {
      const colorAreas: Record<string, string> = {};
      instance.regions.forEach((path, regionId) => {
        colorAreas[regionId] = path.fill as string || '#ffffff';
      });

      elements.push({
        id,
        type: 'template',
        colorAreas,
        position: { x: instance.group.left || 0, y: instance.group.top || 0 },
        size: { width: instance.group.width || 0, height: instance.group.height || 0 },
        editable: true,
      });
    });

    // Add other canvas objects
    canvas.getObjects().forEach((obj, index) => {
      const objId = (obj as any).elementId || `element-${index}`;
      if ((obj as any).templateInstanceId) return; // Skip template groups

      let type: CanvasElement['type'] = 'path';
      if (obj instanceof Rect) type = 'shape';
      else if (obj instanceof Circle) type = 'shape';
      else if (obj instanceof IText) type = 'text';
      else if (obj instanceof FabricImage) type = 'image';

      elements.push({
        id: objId,
        type,
        position: { x: obj.left || 0, y: obj.top || 0 },
        size: { width: obj.width || 0, height: obj.height || 0 },
        color: obj.fill as string,
        editable: obj.selectable || false,
      });
    });

    return elements;
  }, []);

  // Get element by ID
  const getElementById = useCallback((id: string): CanvasElement | null => {
    const elements = getElements();
    return elements.find(el => el.id === id) || null;
  }, [getElements]);

  // Update element properties
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Check if it's a template
    const instance = templateInstancesRef.current.get(id);
    if (instance) {
      if (updates.position) {
        instance.group.set({ left: updates.position.x, top: updates.position.y });
      }
      if (updates.colorAreas) {
        Object.entries(updates.colorAreas).forEach(([regionId, color]) => {
          const path = instance.regions.get(regionId);
          if (path) path.set({ fill: color });
        });
      }
      instance.group.dirty = true;
      canvas.renderAll();
      return;
    }

    // Find regular object
    const objects = canvas.getObjects();
    const obj = objects.find((o, i) => (o as any).elementId === id || `element-${i}` === id);
    if (obj) {
      if (updates.position) {
        obj.set({ left: updates.position.x, top: updates.position.y });
      }
      if (updates.color) {
        obj.set({ fill: updates.color });
      }
      canvas.renderAll();
    }
  }, []);

  // Delete element by ID
  const deleteElement = useCallback((id: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Check if it's a template
    const instance = templateInstancesRef.current.get(id);
    if (instance) {
      canvas.remove(instance.group);
      templateInstancesRef.current.delete(id);
      if (selectedRegionRef.current?.templateInstanceId === id) {
        selectedRegionRef.current = null;
        onRegionSelect?.(null);
      }
      canvas.renderAll();
      toast.success("Template deleted");
      return;
    }

    // Find and remove regular object
    const objects = canvas.getObjects();
    const obj = objects.find((o, i) => (o as any).elementId === id || `element-${i}` === id);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
      toast.success("Element deleted");
    }
  }, [onRegionSelect]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      const templateId = (activeObj as any).templateInstanceId;
      if (templateId) {
        templateInstancesRef.current.delete(templateId);
        if (selectedRegionRef.current?.templateInstanceId === templateId) {
          selectedRegionRef.current = null;
          onRegionSelect?.(null);
        }
      }
      canvas.remove(activeObj);
      canvas.renderAll();
      toast.success("Deleted selected element");
    }
  }, [onRegionSelect]);

  // Select element by ID
  const selectElement = useCallback((id: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const instance = templateInstancesRef.current.get(id);
    if (instance) {
      canvas.setActiveObject(instance.group);
      canvas.renderAll();
      return;
    }

    const objects = canvas.getObjects();
    const obj = objects.find((o, i) => (o as any).elementId === id || `element-${i}` === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  }, []);

  // Select specific region of a template
  const selectRegion = useCallback((templateId: string, regionId: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const instance = templateInstancesRef.current.get(templateId);
    if (!instance) return;

    const path = instance.regions.get(regionId);
    if (!path) return;

    // Clear previous selection
    if (selectedRegionRef.current) {
      const prevInstance = templateInstancesRef.current.get(selectedRegionRef.current.templateInstanceId);
      if (prevInstance) {
        prevInstance.regions.forEach((p) => {
          p.set({ strokeWidth: 1, stroke: '#333333' });
        });
        prevInstance.group.dirty = true;
      }
    }

    // Highlight new selection
    const regionData = (path as any).regionData;
    selectedRegionRef.current = {
      templateInstanceId: templateId,
      regionId,
      regionName: regionData?.regionName || regionId
    };

    instance.regions.forEach((p, id) => {
      p.set({
        strokeWidth: id === regionId ? 3 : 1,
        stroke: id === regionId ? '#d4af37' : '#333333'
      });
    });

    instance.group.dirty = true;
    canvas.renderAll();
    onRegionSelect?.(selectedRegionRef.current);
    toast.success(`Selected: ${selectedRegionRef.current.regionName}`);
  }, [onRegionSelect]);

  // Set background color
  const setBackgroundColor = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
    toast.success(`Background set to ${color}`);
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addShape: (type: 'rectangle' | 'circle') => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const elementId = `shape-${Date.now()}`;
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

      (shape as any).elementId = elementId;
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    },

    addText: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const elementId = `text-${Date.now()}`;
      const text = new IText('Double-click to edit', {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: activeColor,
        fontFamily: 'DM Sans',
      });

      (text as any).elementId = elementId;
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    },

    addImage: (url: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      FabricImage.fromURL(url).then((img) => {
        const elementId = `image-${Date.now()}`;
        (img as any).elementId = elementId;
        img.scaleToWidth(200);
        img.set({ left: 100, top: 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    },

    addTemplate: addTemplateToCanvas,
    fillSelectedRegion: fillRegion,
    fillRegionById,
    getSelectedRegion: () => selectedRegionRef.current,
    clearRegionSelection,
    getElements,
    getElementById,
    updateElement,
    deleteElement,
    deleteSelected,
    selectElement,
    selectRegion,
    setBackgroundColor,

    clear: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      templateInstancesRef.current.clear();
      selectedRegionRef.current = null;
      onRegionSelect?.(null);
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

    exportCanvasDataUrl: () => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      return canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
    },

    getCanvasJSON: () => {
      const canvas = fabricRef.current;
      if (!canvas) return {};
      return canvas.toJSON();
    },

    loadFromJSON: async (json: object) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      
      // Clear existing template instances
      templateInstancesRef.current.clear();
      selectedRegionRef.current = null;
      
      await canvas.loadFromJSON(json);
      canvas.renderAll();
    },
  }), [activeColor, addTemplateToCanvas, fillRegion, fillRegionById, clearRegionSelection, 
      getElements, getElementById, updateElement, deleteElement, deleteSelected, 
      selectElement, selectRegion, setBackgroundColor, onRegionSelect]);

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
