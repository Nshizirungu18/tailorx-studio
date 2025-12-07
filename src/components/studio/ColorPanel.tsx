import { useState } from "react";
import { cn } from "@/lib/utils";
import { ColorPalette } from "./types";
import { allPalettes, generateComplementary, generateAnalogous, generateTriadic, generateSplitComplementary } from "./data/palettes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, TrendingUp, Sparkles, Plus, Copy, Check, PaintBucket, Droplet } from "lucide-react";
import { toast } from "sonner";
import { SelectedRegion } from "./StudioCanvas";

interface ColorPanelProps {
  activeColor: string;
  onColorChange: (color: string) => void;
  selectedRegion?: SelectedRegion | null;
  onFillRegion?: (color: string) => void;
}

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split';

export function ColorPanel({ activeColor, onColorChange, selectedRegion, onFillRegion }: ColorPanelProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('complementary');

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    toast.success(`Copied ${color}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleColorClick = (color: string) => {
    onColorChange(color);
    // If a region is selected, also fill it
    if (selectedRegion && onFillRegion) {
      onFillRegion(color);
    }
  };

  const getHarmonyColors = () => {
    switch (selectedHarmony) {
      case 'complementary': return generateComplementary(activeColor);
      case 'analogous': return generateAnalogous(activeColor);
      case 'triadic': return generateTriadic(activeColor);
      case 'split': return generateSplitComplementary(activeColor);
    }
  };

  const harmonyColors = getHarmonyColors();

  const renderPaletteCard = (palette: ColorPalette) => (
    <Card key={palette.id} className="p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground truncate">{palette.name}</span>
        {palette.year && (
          <span className="text-xs text-muted-foreground">{palette.year}</span>
        )}
      </div>
      <div className="flex gap-1">
        {palette.colors.map((color, i) => (
          <button
            key={i}
            onClick={() => handleColorClick(color)}
            onDoubleClick={() => copyColor(color)}
            className={cn(
              "flex-1 h-8 rounded transition-all hover:scale-105",
              "border border-border/20",
              activeColor === color && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: color }}
            title={`${color} - Click to ${selectedRegion ? 'fill region' : 'use'}, double-click to copy`}
          />
        ))}
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Selected Region Indicator */}
      {selectedRegion && (
        <div className="p-3 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <PaintBucket className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-medium text-primary">Fill Mode Active</p>
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedRegion.regionName}</span>
              </p>
            </div>
            <Droplet className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Click any color to fill the selected region
          </p>
        </div>
      )}

      {/* Current Color */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-lg border border-border shadow-lg cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: activeColor }}
            onClick={() => selectedRegion && onFillRegion?.(activeColor)}
            title={selectedRegion ? "Click to fill selected region" : "Current color"}
          />
          <div className="flex-1">
            <Input
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="font-mono text-sm h-8"
              placeholder="#000000"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyColor(activeColor)}
            className="h-8 w-8"
          >
            {copiedColor === activeColor ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Fill Button */}
        {selectedRegion && (
          <Button 
            variant="gold" 
            size="sm" 
            className="w-full mb-3 gap-2"
            onClick={() => onFillRegion?.(activeColor)}
          >
            <PaintBucket className="w-4 h-4" />
            Fill {selectedRegion.regionName}
          </Button>
        )}

        {/* Color Harmonies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Color Harmonies</span>
            <div className="flex gap-1">
              {(['complementary', 'analogous', 'triadic', 'split'] as HarmonyType[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHarmony(h)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors capitalize",
                    selectedHarmony === h
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {h.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {harmonyColors.map((color, i) => (
              <button
                key={i}
                onClick={() => handleColorClick(color)}
                className="flex-1 h-8 rounded border border-border/20 transition-all hover:scale-105"
                style={{ backgroundColor: color }}
                title={`${color} - Click to ${selectedRegion ? 'fill region' : 'use'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Palette Tabs */}
      <Tabs defaultValue="pantone" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-3 h-9">
          <TabsTrigger value="pantone" className="text-xs gap-1">
            <Palette className="w-3 h-3" />
            Pantone
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="text-xs gap-1">
            <TrendingUp className="w-3 h-3" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="trending" className="text-xs gap-1">
            <Sparkles className="w-3 h-3" />
            Trending
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4">
          <TabsContent value="pantone" className="mt-4 space-y-3">
            {allPalettes.filter(p => p.category === 'pantone').map(renderPaletteCard)}
          </TabsContent>

          <TabsContent value="seasonal" className="mt-4 space-y-3">
            {allPalettes.filter(p => p.category === 'seasonal').map(renderPaletteCard)}
          </TabsContent>

          <TabsContent value="trending" className="mt-4 space-y-3">
            {allPalettes.filter(p => p.category === 'trending').map(renderPaletteCard)}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Create Custom Palette */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Palette
        </Button>
      </div>
    </div>
  );
}
