import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGenerationQueue, Generation } from "@/hooks/useGenerationQueue";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2,
  ImageIcon, AlertCircle, Download
} from "lucide-react";

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; animate?: boolean }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
  processing: { icon: Loader2, label: 'Processing', color: 'text-blue-600 bg-blue-100', animate: true },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-green-600 bg-green-100' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600 bg-red-100' },
};

interface GenerationCardProps {
  generation: Generation;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onSelect?: (generation: Generation) => void;
}

function GenerationCard({ generation, onRetry, onRemove, onSelect }: GenerationCardProps) {
  const config = statusConfig[generation.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  const handleDownload = () => {
    if (!generation.generated_image) return;
    const link = document.createElement('a');
    link.href = generation.generated_image;
    link.download = `generation-${generation.id}.png`;
    link.click();
  };

  return (
    <Card 
      className={cn(
        "p-3 transition-all",
        generation.status === 'completed' && onSelect && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => generation.status === 'completed' && onSelect?.(generation)}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
          {generation.generated_image ? (
            <img 
              src={generation.generated_image} 
              alt="Generated" 
              className="w-full h-full object-cover"
            />
          ) : generation.sketch_data ? (
            <img 
              src={generation.sketch_data} 
              alt="Sketch" 
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] gap-1 px-1.5", config.color)}
            >
              <Icon className={cn("w-3 h-3", config.animate && "animate-spin")} />
              {config.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(generation.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-1">
            <Badge variant="outline" className="text-[9px] px-1">{generation.agent_type}</Badge>
            <Badge variant="outline" className="text-[9px] px-1">{generation.fabric_type}</Badge>
          </div>

          {generation.error_message && (
            <p className="text-[10px] text-red-600 truncate">{generation.error_message}</p>
          )}
          
          {generation.additional_notes && (
            <p className="text-[10px] text-muted-foreground truncate">{generation.additional_notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {generation.status === 'completed' && generation.generated_image && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          )}
          {generation.status === 'failed' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onRetry(generation.id); }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
          {(generation.status === 'pending' || generation.status === 'failed') && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive"
              onClick={(e) => { e.stopPropagation(); onRemove(generation.id); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface GenerationQueuePanelProps {
  onSelectGeneration?: (generation: Generation) => void;
}

export function GenerationQueuePanel({ onSelectGeneration }: GenerationQueuePanelProps) {
  const { user } = useAuth();
  const {
    generations,
    isLoading,
    removeFromQueue,
    retryGeneration,
    pendingCount,
    processingCount,
    completedCount,
    failedCount
  } = useGenerationQueue();

  const [activeTab, setActiveTab] = useState('all');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">Sign in Required</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to use the generation queue and save your history.
        </p>
      </div>
    );
  }

  const filteredGenerations = generations.filter(g => {
    if (activeTab === 'all') return true;
    return g.status === activeTab;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Stats Header */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-[10px] text-yellow-600">Pending</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-lg font-bold text-blue-600">{processingCount}</p>
            <p className="text-[10px] text-blue-600">Processing</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-lg font-bold text-green-600">{completedCount}</p>
            <p className="text-[10px] text-green-600">Completed</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-lg font-bold text-red-600">{failedCount}</p>
            <p className="text-[10px] text-red-600">Failed</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-8">
            <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs px-2">Pending</TabsTrigger>
            <TabsTrigger value="processing" className="text-xs px-2">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs px-2">Done</TabsTrigger>
            <TabsTrigger value="failed" className="text-xs px-2">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeTab === 'all' ? 'No generations yet' : `No ${activeTab} generations`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGenerations.map(generation => (
              <GenerationCard
                key={generation.id}
                generation={generation}
                onRetry={retryGeneration}
                onRemove={removeFromQueue}
                onSelect={onSelectGeneration}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
