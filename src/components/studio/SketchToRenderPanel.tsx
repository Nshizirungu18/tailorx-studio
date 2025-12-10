import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload,
  Sparkles,
  ImageIcon,
  ChevronRight,
  Loader2,
  Download,
  X,
  RefreshCw,
  Wand2,
  Camera,
  Palette,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

const styleOptions = [
  { id: "photorealistic", label: "Photo Real", icon: Camera },
  { id: "editorial", label: "Editorial", icon: Sparkles },
  { id: "illustration", label: "Illustration", icon: Palette },
  { id: "streetwear", label: "Streetwear", icon: Shirt },
  { id: "couture", label: "Couture", icon: Sparkles },
  { id: "minimalist", label: "Minimal", icon: ImageIcon },
];

interface SketchToRenderPanelProps {
  canvasExport?: () => string | null;
}

export function SketchToRenderPanel({ canvasExport }: SketchToRenderPanelProps) {
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("A model on a fashion runway");
  const [referenceStrength, setReferenceStrength] = useState([70]);
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSketchImage(event.target?.result as string);
      toast.success("Sketch uploaded successfully");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCaptureCanvas = useCallback(() => {
    if (canvasExport) {
      const dataUrl = canvasExport();
      if (dataUrl) {
        setSketchImage(dataUrl);
        toast.success("Canvas captured as sketch");
      } else {
        toast.error("Could not capture canvas");
      }
    }
  }, [canvasExport]);

  const handleGenerate = async () => {
    if (!sketchImage) {
      toast.error("Please upload a sketch first");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("sketch-to-render", {
        body: {
          sketchImage,
          prompt,
          referenceStrength: referenceStrength[0],
          style: selectedStyle,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const newImage: GeneratedImage = {
        id: `gen-${Date.now()}`,
        url: data.image,
        prompt: data.prompt,
        style: data.style,
        timestamp: new Date(),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      setActiveImage(newImage);
      toast.success("Image rendered successfully!");
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const link = document.createElement("a");
      link.href = image.url;
      link.download = `render-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const clearSketch = () => {
    setSketchImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">LOOK</h3>
            <p className="text-xs text-muted-foreground">Sketch to Render AI</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Sketch Upload Area */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Sketch
            </Label>
            
            {!sketchImage ? (
              <Card
                className="relative border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Upload Sketch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to browse
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Card>
            ) : (
              <Card className="relative overflow-hidden group">
                <img
                  src={sketchImage}
                  alt="Sketch"
                  className="w-full aspect-[3/4] object-contain bg-secondary/20"
                />
                <button
                  onClick={clearSketch}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </Card>
            )}

            {/* Capture from canvas button */}
            {canvasExport && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2"
                onClick={handleCaptureCanvas}
              >
                <Camera className="w-4 h-4" />
                Capture from Canvas
              </Button>
            )}
          </div>

          {/* Reference Strength Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reference Strength
              </Label>
              <span className="text-xs text-foreground font-mono">
                {referenceStrength[0]}%
              </span>
            </div>
            <Slider
              value={referenceStrength}
              onValueChange={setReferenceStrength}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>

          {/* Style Selection */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {styleOptions.map((style) => {
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center",
                      selectedStyle === style.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-medium">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Prompt
            </Label>
            <div className="relative">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A model on a fashion runway..."
                className="pr-10"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            onClick={handleGenerate}
            disabled={!sketchImage || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Generate Render
              </>
            )}
          </Button>

          {/* Active Generated Image */}
          {activeImage && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Result
                </Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDownload(activeImage)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Card className="overflow-hidden">
                <img
                  src={activeImage.url}
                  alt="Generated render"
                  className="w-full aspect-[3/4] object-cover"
                />
              </Card>
              <Badge variant="outline" className="mt-2 text-xs">
                {styleOptions.find((s) => s.id === activeImage.style)?.label || activeImage.style}
              </Badge>
            </div>
          )}

          {/* Generated Images Gallery */}
          {generatedImages.length > 1 && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Variations
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {generatedImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 transition-all",
                      activeImage?.id === img.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={img.url}
                      alt="Variation"
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
