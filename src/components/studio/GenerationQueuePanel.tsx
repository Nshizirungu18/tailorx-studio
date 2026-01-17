import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerationQueue, Generation } from '@/hooks/useGenerationQueue';
import { formatDistanceToNow } from 'date-fns';
import { 
  Loader2, AlertCircle, CheckCircle2, Clock, XCircle,
  Download, RefreshCw, Trash2, ListTodo
} from 'lucide-react';
import { toast } from 'sonner';

function GenerationCard({ 
  generation, 
  onRetry, 
  onRemove 
}: { 
  generation: Generation; 
  onRetry: () => void; 
  onRemove: () => void;
}) {
  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600', label: 'Pending' },
    processing: { icon: Loader2, color: 'bg-blue-500/10 text-blue-600', label: 'Processing' },
    completed: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600', label: 'Completed' },
    failed: { icon: XCircle, color: 'bg-red-500/10 text-red-600', label: 'Failed' },
  };

  const config = statusConfig[generation.status];
  const StatusIcon = config.icon;

  const handleDownload = () => {
    if (!generation.generated_image) return;
    const link = document.createElement('a');
    link.href = generation.generated_image;
    link.download = `generation-${generation.id}.png`;
    link.click();
    toast.success('Downloaded!');
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${generation.status === 'processing' ? 'animate-spin' : ''}`} />
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(generation.created_at), { addSuffix: true })}
        </span>
      </div>

      {generation.generated_image && (
        <div className="rounded overflow-hidden border">
          <img 
            src={generation.generated_image} 
            alt="Generated" 
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span>Style: <span className="capitalize">{generation.agent_type}</span></span>
        <span>Fabric: <span className="capitalize">{generation.fabric_type}</span></span>
      </div>

      {generation.error_message && (
        <p className="text-xs text-destructive bg-destructive/10 rounded p-2">
          {generation.error_message}
        </p>
      )}

      <div className="flex gap-2">
        {generation.status === 'completed' && generation.generated_image && (
          <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        )}
        {generation.status === 'failed' && (
          <Button onClick={onRetry} variant="outline" size="sm" className="flex-1">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        <Button onClick={onRemove} variant="ghost" size="sm">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function GenerationQueuePanel() {
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

  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Sign In Required</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to use the generation queue.
        </p>
      </div>
    );
  }

  const filteredGenerations = filter === 'all' 
    ? generations 
    : generations.filter(g => g.status === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Generation Queue</h3>
        <div className="flex gap-2 mt-2 text-xs">
          <Badge variant="outline" className="bg-yellow-500/10">
            <Clock className="w-3 h-3 mr-1" />
            {pendingCount}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10">
            <Loader2 className="w-3 h-3 mr-1" />
            {processingCount}
          </Badge>
          <Badge variant="outline" className="bg-green-500/10">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {completedCount}
          </Badge>
          <Badge variant="outline" className="bg-red-500/10">
            <XCircle className="w-3 h-3 mr-1" />
            {failedCount}
          </Badge>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
          <TabsTrigger value="processing" className="text-xs">Active</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
          <TabsTrigger value="failed" className="text-xs">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <ListTodo className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Generations</h3>
          <p className="text-sm text-muted-foreground">
            {filter === 'all' 
              ? 'Add sketches to the queue to start generating.'
              : `No ${filter} generations.`
            }
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {filteredGenerations.map((gen) => (
              <GenerationCard
                key={gen.id}
                generation={gen}
                onRetry={() => retryGeneration(gen.id)}
                onRemove={() => removeFromQueue(gen.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
