import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDesignStorage, SavedDesign } from '@/hooks/useDesignStorage';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Folder, Trash2, Edit2, Check, X, FilePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Json } from '@/integrations/supabase/types';

interface SavedDesignsPanelProps {
  onLoadDesign: (canvasData: Json) => void;
  onNewDesign: () => void;
}

export function SavedDesignsPanel({ onLoadDesign, onNewDesign }: SavedDesignsPanelProps) {
  const { user } = useAuth();
  const {
    designs,
    isLoading,
    currentDesignId,
    loadDesigns,
    loadDesign,
    deleteDesign,
    renameDesign,
    createNewDesign,
  } = useDesignStorage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user, loadDesigns]);

  const handleLoad = async (design: SavedDesign) => {
    const data = await loadDesign(design.id);
    if (data) {
      onLoadDesign(data);
    }
  };

  const handleDelete = async (e: React.MouseEvent, designId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this design?')) {
      await deleteDesign(designId);
    }
  };

  const handleStartRename = (e: React.MouseEvent, design: SavedDesign) => {
    e.stopPropagation();
    setEditingId(design.id);
    setEditName(design.name);
  };

  const handleSaveRename = async (e: React.MouseEvent, designId: string) => {
    e.stopPropagation();
    if (editName.trim()) {
      await renameDesign(designId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleNewDesign = () => {
    createNewDesign();
    onNewDesign();
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Sign in to save and access your designs</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={handleNewDesign}
        >
          <FilePlus className="w-4 h-4" />
          New Design
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No saved designs yet</p>
              <p className="text-xs mt-1">Save your first design to see it here</p>
            </div>
          ) : (
            designs.map((design) => (
              <div
                key={design.id}
                onClick={() => handleLoad(design)}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  currentDesignId === design.id && "bg-accent border border-primary/20"
                )}
              >
                <Folder className="w-5 h-5 text-primary shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {editingId === design.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e as unknown as React.MouseEvent, design.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => handleSaveRename(e, design.id)}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelRename}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{design.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(design.updated_at), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== design.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => handleStartRename(e, design)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={(e) => handleDelete(e, design.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}