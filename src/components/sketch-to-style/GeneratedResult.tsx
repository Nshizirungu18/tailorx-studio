import { Download, RefreshCw, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneratedResultProps {
  image: string | null;
  description: string | null;
  isGenerating: boolean;
  error: string | null;
  cooldownRemaining: number;
  onRegenerate: () => void;
  hasSketch: boolean;
}

export function GeneratedResult({
  image,
  description,
  isGenerating,
  error,
  cooldownRemaining,
  onRegenerate,
  hasSketch,
}: GeneratedResultProps) {
  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.href = image;
    link.download = `fashion-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOnCooldown = cooldownRemaining > 0;
  const canRegenerate = hasSketch && !isGenerating && !isOnCooldown;

  // Empty state
  if (!image && !isGenerating && !error) {
    return (
      <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 bg-secondary/30">
        <div className="p-4 rounded-full bg-muted">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center px-4">
          <p className="font-medium text-foreground">Your design will appear here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a sketch and click Generate
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="aspect-square rounded-xl border-2 border-primary/30 flex flex-col items-center justify-center gap-4 bg-primary/5">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center px-4">
          <p className="font-medium text-foreground">Generating your design...</p>
          <p className="text-sm text-muted-foreground mt-1">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="aspect-square rounded-xl border-2 border-destructive/30 flex flex-col items-center justify-center gap-4 bg-destructive/5">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center px-4">
            <p className="font-medium text-foreground">Generation Failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
        
        <Button
          onClick={onRegenerate}
          disabled={!canRegenerate}
          className="w-full gap-2"
        >
          {isOnCooldown ? (
            <>
              <Clock className="h-4 w-4" />
              Retry in {cooldownRemaining}s
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="aspect-square rounded-xl overflow-hidden border-2 border-primary/30 bg-secondary">
          <img
            src={image!}
            alt="Generated fashion design"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground text-center line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={!canRegenerate}
          className="flex-1 gap-2"
        >
          {isOnCooldown ? (
            <>
              <Clock className="h-4 w-4" />
              {cooldownRemaining}s
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
