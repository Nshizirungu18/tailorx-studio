import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  ImageIcon,
  Wand2,
  SunMedium,
  Contrast,
  Palette,
  Droplets,
  Eraser,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface PhotoEditPanelProps {
  onApplyEffect: (effect: string, value: number) => void;
}

const adjustments = [
  { id: 'brightness', label: 'Brightness', icon: SunMedium, min: -100, max: 100, default: 0 },
  { id: 'contrast', label: 'Contrast', icon: Contrast, min: -100, max: 100, default: 0 },
  { id: 'saturation', label: 'Saturation', icon: Palette, min: -100, max: 100, default: 0 },
  { id: 'blur', label: 'Blur', icon: Droplets, min: 0, max: 20, default: 0 },
];

const quickFilters = [
  { id: 'auto-enhance', label: 'Auto Enhance', icon: Wand2 },
  { id: 'remove-bg', label: 'Remove Background', icon: Eraser },
  { id: 'smooth-fabric', label: 'Smooth Fabric', icon: Layers },
  { id: 'enhance-texture', label: 'Enhance Texture', icon: Sparkles },
];

export function PhotoEditPanel({ onApplyEffect }: PhotoEditPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Photo Editing</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Retouch and enhance your designs
        </p>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-2"
                onClick={() => onApplyEffect(filter.id, 100)}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{filter.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Adjustments */}
      <ScrollArea className="flex-1 p-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Adjustments
        </span>
        <div className="space-y-6 mt-4">
          {adjustments.map((adj) => {
            const Icon = adj.icon;
            return (
              <div key={adj.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{adj.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{adj.default}</span>
                </div>
                <Slider
                  defaultValue={[adj.default]}
                  min={adj.min}
                  max={adj.max}
                  step={1}
                  onValueChange={([v]) => onApplyEffect(adj.id, v)}
                />
              </div>
            );
          })}
        </div>

        {/* Preset Filters */}
        <div className="mt-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Preset Filters
          </span>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {['Natural', 'Warm', 'Cool', 'Vintage', 'B&W', 'Vivid'].map((filter) => (
              <Card
                key={filter}
                className="p-2 cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors text-center"
                onClick={() => onApplyEffect(filter.toLowerCase(), 100)}
              >
                <div className="aspect-square rounded bg-muted/50 mb-1" />
                <span className="text-xs text-muted-foreground">{filter}</span>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Reset Button */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset All Adjustments
        </Button>
      </div>
    </div>
  );
}
