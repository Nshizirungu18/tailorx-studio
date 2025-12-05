import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Square,
  Circle,
  Type,
  Image,
  Layers,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  Wand2,
  Palette,
  Move,
  Eraser,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "select", icon: Move, label: "Select" },
  { id: "pencil", icon: Pencil, label: "Pencil" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "text", icon: Type, label: "Text" },
  { id: "image", icon: Image, label: "Image" },
];

const colors = [
  "#1a1a1a",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#d4a574",
];

export default function Studio() {
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [selectedColor, setSelectedColor] = useState("#1a1a1a");
  const [showGrid, setShowGrid] = useState(false);

  return (
    <Layout hideFooter>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Left Toolbar */}
        <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                selectedTool === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}

          <div className="h-px w-8 bg-border my-2" />

          {/* Color Palette */}
          <div className="flex flex-col gap-1">
            {colors.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  selectedColor === color ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <Button variant="ghost" size="icon">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">100%</span>
              <Button variant="ghost" size="icon">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <Button
                variant={showGrid ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="glass-gold" size="sm" className="gap-2">
                <Wand2 className="w-4 h-4" />
                AI Refine
              </Button>
              <Button variant="ghost" size="icon">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="gold" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center p-8 overflow-auto">
            <div
              className={cn(
                "bg-white w-[800px] h-[600px] rounded-lg shadow-elevated relative",
                showGrid && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAyMCAwIEwgMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"
              )}
            >
              {/* Canvas placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <Palette className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Start designing here</p>
                  <p className="text-sm">Use the tools on the left to create your masterpiece</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Layers & Properties */}
        <div className="w-72 bg-card border-l border-border flex flex-col">
          {/* Layers */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </h3>
              <Button variant="ghost" size="sm">+ Add</Button>
            </div>
            <div className="space-y-2">
              <Card variant="interactive" className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Square className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Background</p>
                    <p className="text-xs text-muted-foreground">Base layer</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Templates Quick Access */}
          <div className="p-4 flex-1 overflow-auto">
            <h3 className="font-display font-semibold text-foreground mb-4">Quick Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Dress", "Shirt", "Pants", "Jacket"].map((item) => (
                <Card
                  key={item}
                  variant="interactive"
                  className="aspect-square flex items-center justify-center"
                >
                  <span className="text-sm text-muted-foreground">{item}</span>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="p-4 border-t border-border">
            <Card variant="gold" className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Ready to help</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Describe your design idea and let AI help you create it.
              </p>
              <Button variant="gold" size="sm" className="w-full">
                Start AI Session
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
