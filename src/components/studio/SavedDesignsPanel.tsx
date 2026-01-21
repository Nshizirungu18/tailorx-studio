import { useEffect, useState, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDesignStorage, SavedDesign } from '@/hooks/useDesignStorage';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Folder, Trash2, Edit2, Check, X, FilePlus, Loader2, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CanvasHandle } from './StudioCanvas';

interface SavedDesignsPanelProps {
  canvasRef: RefObject<CanvasHandle>;
  getCanvasData: () => object | null;
}

export function SavedDesignsPanel({ canvasRef, getCanvasData }: SavedDesignsPanelProps) {
  const { user } = useAuth();
  const {
    designs,
    isLoading,
    isSaving,
    loadDesigns,
    saveDesign,
    loadDesign,
    deleteDesign,
    renameDesign,
    currentDesignId,
    currentDesignName,
    createNewDesign
  } = useDesignStorage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newDesignName, setNewDesignName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user, loadDesigns]);

  const handleSave = async () => {
    const canvasData = getCanvasData();
    if (!canvasData) {
      toast.error('Could not get canvas data');
      return;
    }

    const thumbnail = canvasRef.current?.exportCanvasDataUrl('png') || undefined;
    
    await saveDesign(
      newDesignName || 'Untitled Design',
      JSON.stringify(canvasData),
      thumbnail
    );
    
    setShowSaveDialog(false);
    setNewDesignName('');
  };

  const handleLoad = async (design: SavedDesign) => {
    const result = await loadDesign(design.id);
    if (result && canvasRef.current) {
      try {
        const canvasData = typeof result === 'string' 
          ? JSON.parse(result) 
          : result;
        await canvasRef.current.loadFromJSON(canvasData);
        toast.success(`Loaded "${design.name}"`);
      } catch (err) {
        console.error('Error loading design:', err);
        toast.error('Failed to load design to canvas');
      }
    }
  };

  const handleStartRename = (design: SavedDesign) => {
    setEditingId(design.id);
    setEditName(design.name);
  };

  const handleConfirmRename = async (id: string) => {
    if (editName.trim()) {
      await renameDesign(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Sign In Required</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to save and load designs.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Saved Designs</h3>
          {currentDesignName && (
            <p className="text-sm text-muted-foreground">
              Current: {currentDesignName}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={createNewDesign}>
            <FilePlus className="w-4 h-4 mr-1" />
            New
          </Button>
          
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Design</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Design name..."
                  value={newDesignName}
                  onChange={(e) => setNewDesignName(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <Folder className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Saved Designs</h3>
          <p className="text-sm text-muted-foreground">
            Click "Save" to save your current design.
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {designs.map((design) => (
              <div
                key={design.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                  currentDesignId === design.id && "bg-primary/10 border-primary"
                )}
                onClick={() => handleLoad(design)}
              >
                {design.thumbnail_url ? (
                  <img
                    src={design.thumbnail_url}
                    alt={design.name}
                    className="w-12 h-12 rounded object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {editingId === design.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(design.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleConfirmRename(design.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCancelRename}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium truncate">{design.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(design.updated_at), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>
                
                {editingId !== design.id && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartRename(design)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteDesign(design.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
