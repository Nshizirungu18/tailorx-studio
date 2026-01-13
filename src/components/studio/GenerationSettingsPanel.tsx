import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRenderedProjects } from "@/hooks/useRenderedProjects";
import { useGenerationQueue, GenerationSettings } from "@/hooks/useGenerationQueue";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Upload, Pencil, Sparkles, Download, RefreshCw, Loader2, X, 
  ImageIcon, Camera, Wand2, CheckCircle2, Save, FolderPlus,
  Clock, AlertCircle, Timer, XCircle
} from "lucide-react";

// Agent types
const agentTypes = [
  { id: 'realistic', label: 'Realistic', description: 'Photorealistic fashion photography' },
  { id: 'artistic', label: 'Artistic', description: 'Creative artistic interpretation' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean, minimal aesthetic' },
  { id: 'avantgarde', label: 'Avant-Garde', description: 'Bold, experimental designs' },
];

// Fabric types
const fabricTypes = [
  { id: 'cotton', label: 'Cotton' },
  { id: 'silk', label: 'Silk' },
  { id: 'denim', label: 'Denim' },
  { id: 'leather', label: 'Leather' },
  { id: 'wool', label: 'Wool' },
  { id: 'linen', label: 'Linen' },
  { id: 'velvet', label: 'Velvet' },
  { id: 'synthetic', label: 'Synthetic' },
];

// Lighting styles
const lightingStyles = [
  { id: 'studio', label: 'Studio' },
  { id: 'natural', label: 'Natural' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'soft', label: 'Soft' },
  { id: 'golden_hour', label: 'Golden Hour' },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  sourceSketch?: string;
  fabricType?: string;
  lightingStyle?: string;
}

interface GenerationSettingsPanelProps {
  canvasExport?: () => string | null;
}

export function GenerationSettingsPanel({ canvasExport }: GenerationSettingsPanelProps) {
  const { user } = useAuth();
  const { saveProject, isSaving } = useRenderedProjects();
  const { addToQueue, isSubmitting } = useGenerationQueue();
  
  // Source mode
  const [activeMode, setActiveMode] = useState<'scratch' | 'upload'>('scratch');
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  
  // Generation settings
  const [agentType, setAgentType] = useState('realistic');
  const [fabricType, setFabricType] = useState('cotton');
  const [lightingStyle, setLightingStyle] = useState('studio');
  const [detailLevel, setDetailLevel] = useState(70);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [saveName, setSaveName] = useState('');
  
  // Rate limit handling
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryAbortRef = useRef<AbortController | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSketchImage(event.target?.result as string);
      toast.success('Sketch uploaded!');
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

  const cancelRetry = () => {
    retryAbortRef.current?.abort();
    setIsRetrying(false);
    setRetryAttempt(0);
    setCooldownSeconds(0);
    setIsGenerating(false);
  };

  // Downscale image if too large
  const downscaleImage = async (dataUrl: string, maxSize = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = dataUrl;
    });
  };

  // Generate with retry logic
  const generateWithRetry = async (
    settings: { sketchImage: string; agentType: string; fabricType: string; lightingStyle: string; detailLevel: number; additionalNotes: string },
    attempt = 0,
    signal?: AbortSignal
  ): Promise<GeneratedImage | null> => {
    if (signal?.aborted) return null;

    try {
      // Downscale image before sending
      const processedImage = await downscaleImage(settings.sketchImage);
      
      const { data, error } = await supabase.functions.invoke('sketch-to-render', {
        body: {
          sketchImage: processedImage,
          prompt: settings.additionalNotes || 'Fashion garment design',
          referenceStrength: settings.detailLevel,
          style: settings.agentType,
          fabricType: settings.fabricType,
          lightingStyle: settings.lightingStyle
        }
      });

      if (error) {
        // Check for rate limit error
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          const retryAfter = 15 * Math.pow(2, attempt); // Exponential backoff
          if (attempt < 3) {
            setRetryAttempt(attempt + 1);
            setCooldownSeconds(retryAfter);
            setIsRetrying(true);
            
            // Wait for cooldown
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, retryAfter * 1000);
              signal?.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Aborted'));
              });
            });
            
            return generateWithRetry(settings, attempt + 1, signal);
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw error;
      }

      if (data?.image) {
        return {
          url: data.image,
          prompt: data.prompt || settings.additionalNotes,
          style: data.style || settings.agentType,
          timestamp: Date.now(),
          sourceSketch: settings.sketchImage,
          fabricType: settings.fabricType,
          lightingStyle: settings.lightingStyle
        };
      }
      return null;
    } catch (err: any) {
      if (err.message === 'Aborted') return null;
      console.error('Generation error:', err);
      throw err;
    }
  };

  const handleGenerate = async () => {
    if (!sketchImage) {
      toast.error('Please upload a sketch or capture from canvas first');
      return;
    }

    setIsGenerating(true);
    setRetryAttempt(0);
    setIsRetrying(false);
    retryAbortRef.current = new AbortController();

    try {
      const result = await generateWithRetry(
        { sketchImage, agentType, fabricType, lightingStyle, detailLevel, additionalNotes },
        0,
        retryAbortRef.current.signal
      );

      if (result) {
        setGeneratedImages(prev => [result, ...prev]);
        setActiveImage(result);
        toast.success('Design generated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsRetrying(false);
      setRetryAttempt(0);
    }
  };

  const handleAddToQueue = async () => {
    if (!sketchImage) {
      toast.error('Please upload a sketch or capture from canvas first');
      return;
    }

    const settings: GenerationSettings = {
      sketchData: sketchImage,
      fabricType,
      lightingStyle,
      detailLevel,
      agentType,
      additionalNotes: additionalNotes || undefined
    };

    await addToQueue(settings);
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
    toast.success('Saved to projects!');
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
        <div className="p-4 space-y-5">
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
                          PNG, JPG, SVG up to 10MB
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
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

          {/* Agent Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agent Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {agentTypes.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setAgentType(agent.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    agentType === agent.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/50"
                  )}
                >
                  <p className="text-xs font-medium">{agent.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{agent.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fabric Type</Label>
            <Select value={fabricType} onValueChange={setFabricType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fabricTypes.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lighting Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lighting Style</Label>
            <Select value={lightingStyle} onValueChange={setLightingStyle}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lightingStyles.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detail Level */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Detail Level</Label>
              <span className="text-xs text-muted-foreground">{detailLevel}%</span>
            </div>
            <Slider
              value={[detailLevel]}
              onValueChange={([v]) => setDetailLevel(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional Notes</Label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g., vintage style, bohemian vibes, metallic accents..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Rate Limit Cooldown */}
          {cooldownSeconds > 0 && (
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700">Rate Limited</p>
                  <p className="text-xs text-yellow-600">
                    Retry attempt {retryAttempt}/3 in {cooldownSeconds}s
                  </p>
                  <Progress 
                    value={(1 - cooldownSeconds / (15 * Math.pow(2, retryAttempt - 1))) * 100} 
                    className="mt-2 h-1"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={cancelRetry}
                  className="text-yellow-700"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleGenerate}
              disabled={!sketchImage || isGenerating || cooldownSeconds > 0}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRetrying ? `Retrying (${retryAttempt}/3)...` : 'Generating...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Now
                </>
              )}
            </Button>

            {user && (
              <Button
                variant="outline"
                onClick={handleAddToQueue}
                disabled={!sketchImage || isSubmitting}
                className="w-full gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Add to Queue
              </Button>
            )}
          </div>

          {/* Generated Result */}
          {activeImage && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Generated Design</Label>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-[10px]">{activeImage.style}</Badge>
                  {activeImage.fabricType && (
                    <Badge variant="outline" className="text-[10px]">{activeImage.fabricType}</Badge>
                  )}
                </div>
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
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Save to Project */}
              {user && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Design name..."
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
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

              {/* History/Variations */}
              {generatedImages.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">History</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 rounded-md border-2 overflow-hidden transition-all",
                          activeImage === img 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img 
                          src={img.url} 
                          alt={`Generation ${idx + 1}`}
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
