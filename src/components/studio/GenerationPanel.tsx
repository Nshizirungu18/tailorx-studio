import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGenerationQueue } from "@/hooks/useGenerationQueue";
import { useRenderedProjects } from "@/hooks/useRenderedProjects";
import { 
  Wand2, Download, Loader2, RefreshCw, Save, X, AlertTriangle,
  Paintbrush, Upload
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AGENT_TYPES = [
  { id: 'realistic', label: 'Realistic', description: 'Photorealistic studio quality' },
  { id: 'artistic', label: 'Artistic', description: 'Creative interpretation' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean and simple' },
  { id: 'avant-garde', label: 'Avant-Garde', description: 'Bold and experimental' },
];

const FABRIC_TYPES = [
  'Cotton', 'Silk', 'Denim', 'Leather', 'Wool', 'Linen', 'Velvet', 'Synthetic'
];

const LIGHTING_STYLES = [
  'Studio', 'Natural', 'Dramatic', 'Soft', 'Golden Hour'
];

interface GenerationPanelProps {
  getSketch: () => string | null;
  sketchSource: 'canvas' | 'upload';
  onSketchSourceChange: (source: 'canvas' | 'upload') => void;
  hasUploadedSketch: boolean;
}

interface GeneratedImage {
  id: string;
  url: string;
  timestamp: Date;
}

export function GenerationPanel({ 
  getSketch, 
  sketchSource, 
  onSketchSourceChange,
  hasUploadedSketch 
}: GenerationPanelProps) {
  const { user } = useAuth();
  const { addToQueue, isSubmitting } = useGenerationQueue();
  const { saveProject, isSaving } = useRenderedProjects();
  
  // Settings state
  const [agentType, setAgentType] = useState('realistic');
  const [fabricType, setFabricType] = useState('cotton');
  const [lightingStyle, setLightingStyle] = useState('studio');
  const [detailLevel, setDetailLevel] = useState(70);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GeneratedImage[]>([]);
  
  // Rate limit handling
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [maxRetries] = useState(3);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryAbortRef = useRef<AbortController | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const cancelRetry = useCallback(() => {
    if (retryAbortRef.current) {
      retryAbortRef.current.abort();
      retryAbortRef.current = null;
    }
    setIsRetrying(false);
    setRetryAttempt(0);
    setCooldownSeconds(0);
    setIsGenerating(false);
    toast.info('Generation cancelled');
  }, []);

  const downscaleImage = useCallback((dataUrl: string, maxSize: number = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        if (width <= maxSize && height <= maxSize) {
          resolve(dataUrl);
          return;
        }
        
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = dataUrl;
    });
  }, []);

  const generateWithRetry = useCallback(async (
    sketchData: string,
    attempt: number = 0
  ): Promise<GeneratedImage | null> => {
    const abortController = new AbortController();
    retryAbortRef.current = abortController;
    
    try {
      setRetryAttempt(attempt);
      
      const processedSketch = await downscaleImage(sketchData);
      
      const { data, error } = await supabase.functions.invoke('sketch-to-render', {
        body: {
          sketchImage: processedSketch,
          prompt: additionalNotes || undefined,
          agentType,
          fabricType: fabricType.toLowerCase(),
          lightingStyle: lightingStyle.toLowerCase(),
          detailLevel,
        }
      });

      if (abortController.signal.aborted) return null;

      if (error) {
        // Handle rate limits
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          const retryAfter = 30;
          
          if (attempt < maxRetries - 1) {
            setIsRetrying(true);
            setCooldownSeconds(retryAfter);
            
            await new Promise<void>((resolve, reject) => {
              const checkAbort = setInterval(() => {
                if (abortController.signal.aborted) {
                  clearInterval(checkAbort);
                  reject(new Error('Cancelled'));
                }
              }, 100);
              
              setTimeout(() => {
                clearInterval(checkAbort);
                resolve();
              }, retryAfter * 1000);
            });
            
            return generateWithRetry(sketchData, attempt + 1);
          }
          
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw error;
      }

      if (!data?.imageUrl) {
        throw new Error('No image generated');
      }

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: data.imageUrl,
        timestamp: new Date(),
      };

      return newImage;
    } catch (err) {
      if (abortController.signal.aborted) return null;
      throw err;
    }
  }, [agentType, fabricType, lightingStyle, detailLevel, additionalNotes, maxRetries, downscaleImage]);

  const handleGenerate = useCallback(async () => {
    const sketch = getSketch();
    if (!sketch) {
      toast.error('Please create a sketch first');
      return;
    }

    setIsGenerating(true);
    setRetryAttempt(0);
    setIsRetrying(false);

    try {
      const result = await generateWithRetry(sketch);
      
      if (result) {
        setGeneratedImage(result);
        setGenerationHistory(prev => [result, ...prev].slice(0, 10));
        toast.success('Generation complete!');
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      setIsRetrying(false);
      setRetryAttempt(0);
    }
  }, [getSketch, generateWithRetry]);

  const handleAddToQueue = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to use the queue');
      return;
    }

    const sketch = getSketch();
    if (!sketch) {
      toast.error('Please create a sketch first');
      return;
    }

    await addToQueue({
      sketchData: sketch,
      fabricType: fabricType.toLowerCase(),
      lightingStyle: lightingStyle.toLowerCase(),
      detailLevel,
      agentType,
      additionalNotes: additionalNotes || undefined,
    });
  }, [user, getSketch, addToQueue, fabricType, lightingStyle, detailLevel, agentType, additionalNotes]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `fashion-design-${Date.now()}.png`;
    link.click();
    toast.success('Image downloaded!');
  }, [generatedImage]);

  const handleSaveToProjects = useCallback(async () => {
    if (!generatedImage || !user) {
      toast.error('Please sign in to save projects');
      return;
    }

    await saveProject({
      renderedImageUrl: generatedImage.url,
      name: `Design ${new Date().toLocaleDateString()}`,
      prompt: additionalNotes,
      style: agentType,
    });
  }, [generatedImage, user, saveProject, additionalNotes, agentType]);

  const isDisabled = isGenerating || cooldownSeconds > 0;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">AI Generation Settings</h3>
          
          {/* Sketch Source */}
          <div className="space-y-3 mb-6">
            <Label>Sketch Source</Label>
            <RadioGroup 
              value={sketchSource} 
              onValueChange={(v) => onSketchSourceChange(v as 'canvas' | 'upload')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="canvas" id="canvas" />
                <Label htmlFor="canvas" className="flex items-center gap-2 cursor-pointer">
                  <Paintbrush className="w-4 h-4" />
                  Canvas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" disabled={!hasUploadedSketch} />
                <Label 
                  htmlFor="upload" 
                  className={`flex items-center gap-2 cursor-pointer ${!hasUploadedSketch ? 'opacity-50' : ''}`}
                >
                  <Upload className="w-4 h-4" />
                  Uploaded
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Agent Type */}
        <div className="space-y-3">
          <Label>Style Agent</Label>
          <div className="grid grid-cols-2 gap-2">
            {AGENT_TYPES.map((agent) => (
              <Button
                key={agent.id}
                variant={agentType === agent.id ? "default" : "outline"}
                size="sm"
                onClick={() => setAgentType(agent.id)}
                className="h-auto py-2 flex flex-col items-start text-left"
              >
                <span className="font-medium">{agent.label}</span>
                <span className="text-[10px] opacity-70">{agent.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Fabric Type */}
        <div className="space-y-2">
          <Label>Fabric Type</Label>
          <Select value={fabricType} onValueChange={setFabricType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FABRIC_TYPES.map((fabric) => (
                <SelectItem key={fabric} value={fabric.toLowerCase()}>
                  {fabric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting Style */}
        <div className="space-y-2">
          <Label>Lighting Style</Label>
          <Select value={lightingStyle} onValueChange={setLightingStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIGHTING_STYLES.map((lighting) => (
                <SelectItem key={lighting} value={lighting.toLowerCase()}>
                  {lighting}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Detail Level */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Detail Level</Label>
            <span className="text-sm text-muted-foreground">{detailLevel}%</span>
          </div>
          <Slider
            value={[detailLevel]}
            onValueChange={([v]) => setDetailLevel(v)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label>Additional Notes</Label>
          <Textarea
            placeholder="Add custom instructions for the AI..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Rate Limit Warning */}
        {(isRetrying || cooldownSeconds > 0) && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isRetrying 
                  ? `Retry ${retryAttempt + 1}/${maxRetries} in ${cooldownSeconds}s`
                  : `Cooldown: ${cooldownSeconds}s`
                }
              </span>
            </div>
            <Progress value={(cooldownSeconds / 30) * 100} className="h-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelRetry}
              className="w-full text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {/* Generate Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleGenerate}
            disabled={isDisabled}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Now
              </>
            )}
          </Button>
          
          {user && (
            <Button
              onClick={handleAddToQueue}
              disabled={isSubmitting || isDisabled}
              variant="outline"
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Add to Queue
            </Button>
          )}
        </div>

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Generated Result</Label>
            <div className="relative rounded-lg overflow-hidden border bg-muted/50">
              <img 
                src={generatedImage.url} 
                alt="Generated fashion design"
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleGenerate} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              {user && (
                <Button 
                  onClick={handleSaveToProjects} 
                  variant="outline" 
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quick History */}
        {generationHistory.length > 1 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm">Recent Generations</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {generationHistory.slice(1, 5).map((img) => (
                <button
                  key={img.id}
                  onClick={() => setGeneratedImage(img)}
                  className="flex-shrink-0 w-16 h-16 rounded border overflow-hidden hover:ring-2 ring-primary transition-all"
                >
                  <img 
                    src={img.url} 
                    alt="Previous generation"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
