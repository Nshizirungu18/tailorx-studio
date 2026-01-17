import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Download, Loader2, History, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  generated_image: string;
  fabric_type: string;
  lighting_style: string;
  agent_type: string;
  detail_level: number;
  created_at: string;
  additional_notes: string | null;
}

export function GenerationHistoryPanel() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .not('generated_image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setHistory(data as HistoryItem[] || []);
      } catch (err) {
        console.error('Error loading history:', err);
        toast.error('Failed to load generation history');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.generated_image;
    link.download = `fashion-design-${item.id}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      toast.success('Removed from history');
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Sign In Required</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to view your generation history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <History className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">No History Yet</h3>
        <p className="text-sm text-muted-foreground">
          Your completed generations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Generation History</h3>
        <p className="text-sm text-muted-foreground">{history.length} completed generations</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-3 pr-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all hover:ring-2 ring-primary ${
                selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <img
                src={item.generated_image}
                alt="Generated design"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {selectedItem && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="rounded-lg overflow-hidden border">
            <img
              src={selectedItem.generated_image}
              alt="Selected design"
              className="w-full h-auto"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Style:</span>
              <span className="ml-1 capitalize">{selectedItem.agent_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fabric:</span>
              <span className="ml-1 capitalize">{selectedItem.fabric_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Lighting:</span>
              <span className="ml-1 capitalize">{selectedItem.lighting_style}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Detail:</span>
              <span className="ml-1">{selectedItem.detail_level}%</span>
            </div>
          </div>

          {selectedItem.additional_notes && (
            <p className="text-xs text-muted-foreground italic">
              "{selectedItem.additional_notes}"
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handleDownload(selectedItem)}
              size="sm"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => handleDelete(selectedItem.id)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
