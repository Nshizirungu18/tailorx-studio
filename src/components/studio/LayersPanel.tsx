import { cn } from "@/lib/utils";
import { Layer } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Layers,
  ChevronUp,
  ChevronDown,
  Copy,
  Merge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
}

export function LayersPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerOpacityChange,
  onLayerAdd,
  onLayerDelete,
  onLayerDuplicate,
  onLayerMoveUp,
  onLayerMoveDown,
}: LayersPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Layers</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onLayerAdd} className="h-8 gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {layers.map((layer, index) => (
            <Card
              key={layer.id}
              onClick={() => onLayerSelect(layer.id)}
              className={cn(
                "p-2 cursor-pointer transition-all",
                activeLayerId === layer.id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/20 hover:bg-secondary/40",
                !layer.visible && "opacity-50"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Visibility */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle(layer.id);
                  }}
                  className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{layer.name}</p>
                  <p className="text-xs text-muted-foreground">{layer.opacity}%</p>
                </div>

                {/* Lock */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerLockToggle(layer.id);
                  }}
                  className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <span className="text-xs">•••</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onLayerDuplicate(layer.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onLayerMoveUp(layer.id)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onLayerMoveDown(layer.id)}
                      disabled={index === layers.length - 1}
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onLayerDelete(layer.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Opacity Slider (when active) */}
              {activeLayerId === layer.id && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Opacity</span>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={([v]) => onLayerOpacityChange(layer.id, v)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8">{layer.opacity}%</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
