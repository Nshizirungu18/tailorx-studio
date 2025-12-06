import { useState } from "react";
import { cn } from "@/lib/utils";
import { brushPresets } from "./data/templates";
import { BrushPreset } from "./types";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Paintbrush, Airplay, Sparkles, Grid3X3 } from "lucide-react";

interface BrushPanelProps {
  activePreset: BrushPreset | null;
  onPresetSelect: (preset: BrushPreset) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushOpacity: number;
  onBrushOpacityChange: (opacity: number) => void;
  brushHardness: number;
  onBrushHardnessChange: (hardness: number) => void;
}

const brushCategories = [
  { id: 'pencil', label: 'Pencil', icon: Pencil },
  { id: 'brush', label: 'Brush', icon: Paintbrush },
  { id: 'airbrush', label: 'Airbrush', icon: Airplay },
  { id: 'texture', label: 'Texture', icon: Sparkles },
  { id: 'pattern', label: 'Pattern', icon: Grid3X3 },
];

export function BrushPanel({
  activePreset,
  onPresetSelect,
  brushSize,
  onBrushSizeChange,
  brushOpacity,
  onBrushOpacityChange,
  brushHardness,
  onBrushHardnessChange,
}: BrushPanelProps) {
  const [activeTab, setActiveTab] = useState('pencil');

  const filteredPresets = brushPresets.filter(p => p.type === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Brush Settings */}
      <div className="p-4 border-b border-border space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Size</span>
            <span className="text-xs text-foreground font-mono">{brushSize}px</span>
          </div>
          <Slider
            value={[brushSize]}
            onValueChange={([v]) => onBrushSizeChange(v)}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Opacity</span>
            <span className="text-xs text-foreground font-mono">{brushOpacity}%</span>
          </div>
          <Slider
            value={[brushOpacity]}
            onValueChange={([v]) => onBrushOpacityChange(v)}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Hardness</span>
            <span className="text-xs text-foreground font-mono">{brushHardness}%</span>
          </div>
          <Slider
            value={[brushHardness]}
            onValueChange={([v]) => onBrushHardnessChange(v)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Brush Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-5 h-9">
          {brushCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs p-1">
                <Icon className="w-4 h-4" />
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredPresets.map((preset) => (
              <Card
                key={preset.id}
                onClick={() => onPresetSelect(preset)}
                className={cn(
                  "p-3 cursor-pointer transition-all",
                  "flex items-center gap-3",
                  activePreset?.id === preset.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
              >
                {/* Brush Preview */}
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <div
                    className="rounded-full bg-foreground"
                    style={{
                      width: Math.min(preset.size, 24),
                      height: Math.min(preset.size, 24),
                      opacity: preset.opacity / 100,
                      filter: `blur(${(100 - preset.hardness) / 50}px)`,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {preset.size}px · {preset.opacity}% · {preset.hardness}% hard
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
