import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkflowStage, ToolType, Layer, BrushPreset } from "@/components/studio/types";
import { WorkflowTabs } from "@/components/studio/WorkflowTabs";
import { ToolSidebar } from "@/components/studio/ToolSidebar";
import { ColorPanel } from "@/components/studio/ColorPanel";
import { TemplatesPanel } from "@/components/studio/TemplatesPanel";
import { BrushPanel } from "@/components/studio/BrushPanel";
import { LayersPanel } from "@/components/studio/LayersPanel";
import { AIAssistantPanel } from "@/components/studio/AIAssistantPanel";
import { PhotoEditPanel } from "@/components/studio/PhotoEditPanel";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { StudioCanvas, CanvasHandle, SelectedRegion } from "@/components/studio/StudioCanvas";
import {
  Undo, Redo, ZoomIn, ZoomOut, Grid3X3, Ruler, Save, Download, Wand2,
  Palette, PenTool, Sparkles, ImageIcon, Layers, X,
} from "lucide-react";
import { toast } from "sonner";

const rightPanelTabs = {
  color: [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'ai', label: 'AI', icon: Wand2 },
  ],
  sketch: [
    { id: 'templates', label: 'Templates', icon: PenTool },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers },
  ],
  detail: [
    { id: 'brushes', label: 'Brushes', icon: Sparkles },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers },
  ],
  refine: [
    { id: 'edit', label: 'Edit', icon: ImageIcon },
    { id: 'ai', label: 'AI', icon: Wand2 },
  ],
  present: [
    { id: 'export', label: 'Export', icon: Download },
    { id: 'layers', label: 'Layers', icon: Layers },
  ],
};

export default function Studio() {
  const canvasRef = useRef<CanvasHandle>(null);
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('sketch');
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushHardness, setBrushHardness] = useState(70);
  const [activePreset, setActivePreset] = useState<BrushPreset | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeRightTab, setActiveRightTab] = useState('templates');
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'bg', name: 'Background', visible: true, locked: true, opacity: 100, blendMode: 'normal', type: 'layer' },
    { id: 'sketch', name: 'Sketch Layer', visible: true, locked: false, opacity: 100, blendMode: 'normal', type: 'layer' },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('sketch');

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 400);
    setZoom(newZoom);
    canvasRef.current?.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 25);
    setZoom(newZoom);
    canvasRef.current?.setZoom(newZoom);
  };

  const handleExport = (format: string) => {
    canvasRef.current?.exportCanvas(format as 'png' | 'jpg' | 'svg');
  };

  const handleTemplateSelect = (templateId: string) => {
    canvasRef.current?.addTemplate(templateId);
  };

  const handleFillRegion = (color: string) => {
    canvasRef.current?.fillSelectedRegion(color);
  };

  const handleClearSelection = () => {
    canvasRef.current?.clearRegionSelection();
    setSelectedRegion(null);
  };

  const handleRegionSelect = (region: SelectedRegion | null) => {
    setSelectedRegion(region);
    // Auto-switch to colors tab when a region is selected
    if (region) {
      setActiveRightTab('colors');
    }
  };

  const handleAddLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      type: 'layer',
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
  };

  const currentTabs = rightPanelTabs[currentStage];

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Top Workflow Bar */}
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-lg font-semibold text-gradient-gold">
              Chromatique Studio
            </h1>
            <WorkflowTabs currentStage={currentStage} onStageChange={setCurrentStage} />
          </div>
          <div className="flex items-center gap-2">
            {/* Selection indicator */}
            {selectedRegion && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-xs text-primary font-medium">
                  {selectedRegion.regionName}
                </span>
                <button 
                  onClick={handleClearSelection}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-primary" />
                </button>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.undo()}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.redo()}>
              <Redo className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[50px] text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant={showGrid ? "secondary" : "ghost"} size="icon" onClick={() => setShowGrid(!showGrid)}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={showGuides ? "secondary" : "ghost"} size="icon" onClick={() => setShowGuides(!showGuides)}>
              <Ruler className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={() => toast.success("Design saved!")}>
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="gold" size="sm" className="gap-2" onClick={() => setCurrentStage('present')}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tool Sidebar */}
          <ToolSidebar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            brushOpacity={brushOpacity}
            onBrushOpacityChange={setBrushOpacity}
            activeColor={activeColor}
            onColorChange={setActiveColor}
          />

          {/* Canvas Area */}
          <div className="flex-1 bg-muted/20 flex items-center justify-center p-8 overflow-auto">
            <StudioCanvas
              ref={canvasRef}
              width={800}
              height={1000}
              activeTool={activeTool}
              activeColor={activeColor}
              brushSize={brushSize}
              brushOpacity={brushOpacity}
              showGrid={showGrid}
              showGuides={showGuides}
              onRegionSelect={handleRegionSelect}
            />
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-border">
              {currentTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                      activeRightTab === tab.id
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {activeRightTab === 'colors' && (
                <ColorPanel 
                  activeColor={activeColor} 
                  onColorChange={setActiveColor}
                  selectedRegion={selectedRegion}
                  onFillRegion={handleFillRegion}
                />
              )}
              {activeRightTab === 'templates' && (
                <TemplatesPanel onTemplateSelect={handleTemplateSelect} />
              )}
              {activeRightTab === 'brushes' && (
                <BrushPanel
                  activePreset={activePreset}
                  onPresetSelect={setActivePreset}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  brushOpacity={brushOpacity}
                  onBrushOpacityChange={setBrushOpacity}
                  brushHardness={brushHardness}
                  onBrushHardnessChange={setBrushHardness}
                />
              )}
              {activeRightTab === 'layers' && (
                <LayersPanel
                  layers={layers}
                  activeLayerId={activeLayerId}
                  onLayerSelect={setActiveLayerId}
                  onLayerVisibilityToggle={(id) => setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l))}
                  onLayerLockToggle={(id) => setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l))}
                  onLayerOpacityChange={(id, opacity) => setLayers(layers.map(l => l.id === id ? { ...l, opacity } : l))}
                  onLayerAdd={handleAddLayer}
                  onLayerDelete={(id) => setLayers(layers.filter(l => l.id !== id))}
                  onLayerDuplicate={(id) => {
                    const layer = layers.find(l => l.id === id);
                    if (layer) {
                      const newLayer = { ...layer, id: `${id}-copy-${Date.now()}`, name: `${layer.name} Copy` };
                      setLayers([newLayer, ...layers]);
                    }
                  }}
                  onLayerMoveUp={(id) => {
                    const idx = layers.findIndex(l => l.id === id);
                    if (idx > 0) {
                      const newLayers = [...layers];
                      [newLayers[idx - 1], newLayers[idx]] = [newLayers[idx], newLayers[idx - 1]];
                      setLayers(newLayers);
                    }
                  }}
                  onLayerMoveDown={(id) => {
                    const idx = layers.findIndex(l => l.id === id);
                    if (idx < layers.length - 1) {
                      const newLayers = [...layers];
                      [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
                      setLayers(newLayers);
                    }
                  }}
                />
              )}
              {activeRightTab === 'ai' && (
                <AIAssistantPanel onSuggestionApply={(s) => toast.info(s)} />
              )}
              {activeRightTab === 'edit' && (
                <PhotoEditPanel onApplyEffect={(e, v) => toast.success(`Applied ${e}: ${v}`)} />
              )}
              {activeRightTab === 'export' && (
                <ExportPanel onExport={handleExport} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
