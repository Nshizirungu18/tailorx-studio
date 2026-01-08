import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackendStatusBannerProps {
  isHealthy: boolean | null;
  error: string | null;
  onRetry: () => void;
}

export function BackendStatusBanner({ isHealthy, error, onRetry }: BackendStatusBannerProps) {
  // Don't show anything while checking or if healthy
  if (isHealthy === null || isHealthy === true) {
    return null;
  }

  return (
    <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">
          Backend Unavailable
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {error || "Cannot reach the generation service. Check your connection or try again."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="flex-shrink-0 gap-1.5"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}
