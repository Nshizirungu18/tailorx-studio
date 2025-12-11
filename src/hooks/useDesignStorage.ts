import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface SavedDesign {
  id: string;
  name: string;
  canvas_data: Json;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UseDesignStorageReturn {
  designs: SavedDesign[];
  isLoading: boolean;
  isSaving: boolean;
  currentDesignId: string | null;
  currentDesignName: string;
  loadDesigns: () => Promise<void>;
  saveDesign: (canvasData: Json, name?: string, thumbnailDataUrl?: string) => Promise<string | null>;
  loadDesign: (designId: string) => Promise<Json | null>;
  deleteDesign: (designId: string) => Promise<boolean>;
  renameDesign: (designId: string, newName: string) => Promise<boolean>;
  setCurrentDesignId: (id: string | null) => void;
  setCurrentDesignName: (name: string) => void;
  createNewDesign: () => void;
}

export function useDesignStorage(): UseDesignStorageReturn {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [currentDesignName, setCurrentDesignName] = useState('Untitled Design');

  const loadDesigns = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('id, name, canvas_data, thumbnail_url, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDesigns((data as SavedDesign[]) || []);
    } catch (err) {
      console.error('Failed to load designs:', err);
      toast.error('Failed to load designs');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveDesign = useCallback(async (
    canvasData: Json,
    name?: string,
    thumbnailDataUrl?: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to save designs');
      return null;
    }

    setIsSaving(true);
    const designName = name || currentDesignName;

    try {
      if (currentDesignId) {
        // Update existing design
        const { error } = await supabase
          .from('designs')
          .update({
            canvas_data: canvasData,
            name: designName,
            thumbnail_url: thumbnailDataUrl || null,
          })
          .eq('id', currentDesignId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Design saved!');
        await loadDesigns();
        return currentDesignId;
      } else {
        // Create new design
        const { data, error } = await supabase
          .from('designs')
          .insert({
            user_id: user.id,
            canvas_data: canvasData,
            name: designName,
            thumbnail_url: thumbnailDataUrl || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        const newId = data.id;
        setCurrentDesignId(newId);
        toast.success('Design saved!');
        await loadDesigns();
        return newId;
      }
    } catch (err) {
      console.error('Failed to save design:', err);
      toast.error('Failed to save design');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, currentDesignId, currentDesignName, loadDesigns]);

  const loadDesign = useCallback(async (designId: string): Promise<Json | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('id, name, canvas_data')
        .eq('id', designId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Design not found');
        return null;
      }

      setCurrentDesignId(data.id);
      setCurrentDesignName(data.name);
      toast.success(`Loaded: ${data.name}`);
      return data.canvas_data;
    } catch (err) {
      console.error('Failed to load design:', err);
      toast.error('Failed to load design');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteDesign = useCallback(async (designId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (currentDesignId === designId) {
        setCurrentDesignId(null);
        setCurrentDesignName('Untitled Design');
      }

      toast.success('Design deleted');
      await loadDesigns();
      return true;
    } catch (err) {
      console.error('Failed to delete design:', err);
      toast.error('Failed to delete design');
      return false;
    }
  }, [user, currentDesignId, loadDesigns]);

  const renameDesign = useCallback(async (designId: string, newName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('designs')
        .update({ name: newName })
        .eq('id', designId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (currentDesignId === designId) {
        setCurrentDesignName(newName);
      }

      toast.success('Design renamed');
      await loadDesigns();
      return true;
    } catch (err) {
      console.error('Failed to rename design:', err);
      toast.error('Failed to rename design');
      return false;
    }
  }, [user, currentDesignId, loadDesigns]);

  const createNewDesign = useCallback(() => {
    setCurrentDesignId(null);
    setCurrentDesignName('Untitled Design');
  }, []);

  return {
    designs,
    isLoading,
    isSaving,
    currentDesignId,
    currentDesignName,
    loadDesigns,
    saveDesign,
    loadDesign,
    deleteDesign,
    renameDesign,
    setCurrentDesignId,
    setCurrentDesignName,
    createNewDesign,
  };
}