import { cn } from "@/lib/utils";
import { ToolType, BrushPreset } from "./types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  MousePointer2,
  Pencil,
  Paintbrush,
  Airplay,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Image,
  Pipette,
  PaintBucket,
  Grid3X3,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolSidebarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushOpacity: number;
  onBrushOpacityChange: (opacity: number) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
}

const tools: { id: ToolType; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'pencil', icon: Pencil, label: 'Pencil (P)' },
  { id: 'brush', icon: Paintbrush, label: 'Brush (B)' },
  { id: 'airbrush', icon: Airplay, label: 'Airbrush (A)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'image', icon: Image, label: 'Image (I)' },
  { id: 'eyedropper', icon: Pipette, label: 'Eyedropper (D)' },
  { id: 'fill', icon: PaintBucket, label: 'Fill (G)' },
  { id: 'pattern', icon: Grid3X3, label: 'Pattern (X)' },
];

const quickColors = [
  '#1a1a1a', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#d4a574',
];

export function ToolSidebar({
  activeTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  brushOpacity,
  onBrushOpacityChange,
  activeColor,
  onColorChange,
}: ToolSidebarProps) {
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-1">
      <TooltipProvider delayDuration={300}>
        {/* Tools */}
        <div className="flex flex-col gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToolChange(tool.id)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      activeTool === tool.id
                        ? "bg-primary text-primary-foreground shadow-gold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="h-px w-10 bg-border my-3" />

        {/* Quick Colors */}
        <div className="flex flex-col gap-1 items-center">
          {quickColors.slice(0, 6).map((color) => (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onColorChange(color)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                    activeColor === color ? "border-primary ring-2 ring-primary/30" : "border-border/50"
                  )}
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{color}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="h-px w-10 bg-border my-3" />

        {/* Brush Size & Opacity (vertical sliders would go here in a full implementation) */}
        <div className="flex flex-col gap-2 items-center text-xs text-muted-foreground">
          <span className="font-medium">{brushSize}px</span>
          <span className="opacity-60">{brushOpacity}%</span>
        </div>
      </TooltipProvider>
    </div>
  );
}
