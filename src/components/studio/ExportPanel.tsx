import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  FileImage,
  FileCode,
  FileText,
  Upload,
  Share2,
  Cloud,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ExportPanelProps {
  onExport: (format: string, options: ExportOptions) => void;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality: number;
  scale: number;
  includeBackground: boolean;
  filename: string;
}

const formats = [
  { id: 'png', label: 'PNG', description: 'Lossless, transparent support', icon: FileImage },
  { id: 'jpg', label: 'JPG', description: 'Smaller file size', icon: FileImage },
  { id: 'svg', label: 'SVG', description: 'Vector, scalable', icon: FileCode },
  { id: 'pdf', label: 'PDF', description: 'Print-ready', icon: FileText },
];

export function ExportPanel({ onExport }: ExportPanelProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 100,
    scale: 2,
    includeBackground: true,
    filename: 'chromatique-design',
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onExport(options.format, options);
    setIsExporting(false);
    toast.success(`Exported as ${options.format.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Export & Share</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Save your design in multiple formats
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Filename */}
          <div>
            <Label className="text-xs text-muted-foreground">Filename</Label>
            <Input
              value={options.filename}
              onChange={(e) => setOptions({ ...options, filename: e.target.value })}
              className="mt-1"
              placeholder="design-name"
            />
          </div>

          {/* Format Selection */}
          <div>
            <Label className="text-xs text-muted-foreground">Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(v) => setOptions({ ...options, format: v as ExportOptions['format'] })}
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {formats.map((format) => {
                const Icon = format.icon;
                const isSelected = options.format === format.id;
                return (
                  <Label
                    key={format.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={format.id} className="sr-only" />
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{format.label}</p>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Quality (for JPG/PNG) */}
          {(options.format === 'jpg' || options.format === 'png') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <span className="text-xs font-mono text-foreground">{options.quality}%</span>
              </div>
              <Slider
                value={[options.quality]}
                onValueChange={([v]) => setOptions({ ...options, quality: v })}
                min={10}
                max={100}
                step={10}
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Scale</Label>
              <span className="text-xs font-mono text-foreground">{options.scale}x</span>
            </div>
            <Slider
              value={[options.scale]}
              onValueChange={([v]) => setOptions({ ...options, scale: v })}
              min={1}
              max={4}
              step={0.5}
            />
          </div>

          {/* Include Background */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Include Background</Label>
              <p className="text-xs text-muted-foreground">Export with canvas background</p>
            </div>
            <Switch
              checked={options.includeBackground}
              onCheckedChange={(v) => setOptions({ ...options, includeBackground: v })}
            />
          </div>

          {/* Size Preview */}
          <Card className="p-3 bg-secondary/30">
            <p className="text-xs text-muted-foreground">Estimated Output</p>
            <p className="text-sm font-medium text-foreground">
              {800 * options.scale} × {1000 * options.scale} px
            </p>
          </Card>
        </div>
      </ScrollArea>

      {/* Export Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="gold"
          className="w-full gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <span className="animate-pulse">Exporting...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export {options.format.toUpperCase()}
            </>
          )}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Cloud className="w-4 h-4" />
            Save to Cloud
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="w-4 h-4" />
            Share Link
          </Button>
        </div>
      </div>
    </div>
  );
}
