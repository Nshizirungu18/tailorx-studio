import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useRenderedProjects } from "@/hooks/useRenderedProjects";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Upload, Pencil, Sparkles, Download, RefreshCw, Loader2, X, 
  ImageIcon, Camera, Wand2, CheckCircle2, Save, FolderPlus
} from "lucide-react";

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  sourceSketch?: string;
}

const styleOptions = [
  { id: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { id: 'editorial', label: 'Editorial', icon: '📰' },
  { id: 'runway', label: 'Runway', icon: '👠' },
  { id: 'streetwear', label: 'Streetwear', icon: '🛹' },
  { id: 'luxury', label: 'Luxury', icon: '💎' },
  { id: 'minimalist', label: 'Minimalist', icon: '◻️' },
];

interface DesignModePanelProps {
  canvasExport?: () => string | null;
  onSaveToProject?: (imageUrl: string, name: string) => void;
}

export function DesignModePanel({ canvasExport }: DesignModePanelProps) {
  const { user } = useAuth();
  const { saveProject, isSaving } = useRenderedProjects();
  
  const [activeMode, setActiveMode] = useState<'scratch' | 'upload'>('scratch');
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [referenceStrength, setReferenceStrength] = useState(75);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['photorealistic']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [saveName, setSaveName] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSketchImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCaptureCanvas = useCallback(() => {
    if (!canvasExport) {
      toast.error('Canvas export not available');
      return;
    }
    const dataUrl = canvasExport();
    if (dataUrl) {
      setSketchImage(dataUrl);
      toast.success('Canvas captured!');
    } else {
      toast.error('Failed to capture canvas');
    }
  }, [canvasExport]);

  const clearSketch = () => {
    setSketchImage(null);
    setGeneratedImages([]);
    setActiveImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  const generateImage = async (style: string, customPrompt?: string) => {
    const sourceImage = sketchImage || (activeImage?.url);
    if (!sourceImage) return null;

    try {
      const { data, error } = await supabase.functions.invoke('sketch-to-render', {
        body: {
          sketchImage: sourceImage,
          prompt: customPrompt || prompt || 'Fashion garment design',
          referenceStrength,
          style
        }
      });

      if (error) throw error;

      // The edge function returns 'image', not 'generatedImage'
      if (data?.image) {
        return {
          url: data.image,
          prompt: data.prompt || customPrompt || prompt,
          style: data.style || style,
          timestamp: Date.now(),
          sourceSketch: sketchImage || undefined
        };
      }
      return null;
    } catch (err) {
      console.error(`Generation error for ${style}:`, err);
      toast.error('Generation failed. Please try again.');
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!sketchImage) {
      toast.error('Please upload a sketch or capture from canvas first');
      return;
    }

    if (selectedStyles.length === 0) {
      toast.error('Please select at least one style');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setActiveImage(null);

    try {
      const results = await Promise.all(
        selectedStyles.map(style => generateImage(style))
      );

      const successfulResults = results.filter(Boolean) as GeneratedImage[];
      
      if (successfulResults.length > 0) {
        setGeneratedImages(successfulResults);
        setActiveImage(successfulResults[0]);
        toast.success(`Generated ${successfulResults.length} image(s)!`);
      } else {
        toast.error('Generation failed. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `design-${image.style}-${Date.now()}.png`;
    link.click();
  };

  const handleSaveToProject = async () => {
    if (!activeImage) return;
    if (!saveName.trim()) {
      toast.error('Please enter a name for the design');
      return;
    }
    if (!user) {
      toast.error('Please sign in to save projects');
      return;
    }

    await saveProject({
      name: saveName.trim(),
      renderedImageUrl: activeImage.url,
      sourceSketchUrl: activeImage.sourceSketch,
      prompt: activeImage.prompt,
      style: activeImage.style,
    });
    setSaveName('');
  };

  const handleModify = async () => {
    if (!activeImage || !modificationPrompt.trim()) {
      toast.error('Please enter modification instructions');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateImage(activeImage.style, modificationPrompt);
      if (result) {
        setGeneratedImages(prev => [result, ...prev]);
        setActiveImage(result);
        toast.success('Design modified!');
        setModificationPrompt('');
      } else {
        toast.error('Modification failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="p-4 border-b border-border">
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'scratch' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scratch" className="gap-2">
              <Pencil className="w-4 h-4" />
              From Canvas
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Sketch
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Sketch Source */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Source Sketch</Label>
            
            {!sketchImage ? (
              <div className="space-y-3">
                {activeMode === 'scratch' ? (
                  <Card 
                    onClick={handleCaptureCanvas}
                    className="p-6 border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Capture from Canvas</p>
                        <p className="text-xs text-muted-foreground">
                          Use your current canvas design
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Upload Sketch</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={sketchImage} 
                  alt="Sketch" 
                  className="w-full aspect-[3/4] object-contain rounded-lg border border-border bg-white"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearSketch}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Badge className="absolute bottom-2 left-2 bg-black/70">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
            )}
          </div>

          {/* Reference Strength */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Reference Strength</Label>
              <span className="text-xs text-muted-foreground">{referenceStrength}%</span>
            </div>
            <Slider
              value={[referenceStrength]}
              onValueChange={([v]) => setReferenceStrength(v)}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher = closer to original sketch
            </p>
          </div>

          {/* Style Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Render Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedStyles.includes(style.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/50"
                  )}
                >
                  <span className="text-lg mr-2">{style.icon}</span>
                  <span className="text-xs font-medium">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Details</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., silk fabric, evening wear, metallic accents..."
              className="text-sm"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!sketchImage || isGenerating || selectedStyles.length === 0}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Photorealistic
              </>
            )}
          </Button>

          {/* Generated Result */}
          {activeImage && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Generated Design</Label>
                <Badge variant="secondary">{activeImage.style}</Badge>
              </div>
              
              <div className="relative">
                <img 
                  src={activeImage.url} 
                  alt="Generated" 
                  className="w-full aspect-[3/4] object-cover rounded-lg border border-border"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(activeImage)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Modify with Prompt */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Modify Design</Label>
                <Textarea
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  placeholder="e.g., change the sleeves to long sleeves, add gold buttons..."
                  rows={2}
                  className="text-sm"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleModify}
                  disabled={isGenerating || !modificationPrompt.trim()}
                  className="w-full gap-2"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Apply Modifications
                </Button>
              </div>

              {/* Save to Project */}
              {user && (
                <div className="flex gap-2">
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Design name..."
                    className="flex-1 text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSaveToProject} 
                    disabled={isSaving}
                    className="gap-1"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3 h-3" />}
                    Save
                  </Button>
                </div>
              )}

              {/* Variations */}
              {generatedImages.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Variations</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden transition-all",
                          activeImage === img 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img 
                          src={img.url} 
                          alt={`Variation ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}