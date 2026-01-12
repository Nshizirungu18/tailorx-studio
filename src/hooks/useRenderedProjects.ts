import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RenderedProject {
  id: string;
  name: string;
  source_sketch_url: string | null;
  rendered_image_url: string;
  prompt: string | null;
  style: string | null;
  design_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TailorTransfer {
  id: string;
  rendered_project_id: string;
  tailor_id: string;
  tailor_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  notes: string | null;
  created_at: string;
}

interface UseRenderedProjectsReturn {
  projects: RenderedProject[];
  transfers: TailorTransfer[];
  isLoading: boolean;
  isSaving: boolean;
  loadProjects: () => Promise<void>;
  saveProject: (data: {
    name: string;
    renderedImageUrl: string;
    sourceSketchUrl?: string;
    prompt?: string;
    style?: string;
    designId?: string;
  }) => Promise<string | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  renameProject: (projectId: string, newName: string) => Promise<boolean>;
  transferToTailor: (projectId: string, tailorId: string, tailorName: string, notes?: string) => Promise<boolean>;
  loadTransfers: () => Promise<void>;
}

export function useRenderedProjects(): UseRenderedProjectsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<RenderedProject[]>([]);
  const [transfers, setTransfers] = useState<TailorTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rendered_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data as RenderedProject[]) || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadTransfers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tailor_transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers((data as TailorTransfer[]) || []);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    }
  }, [user]);

  const saveProject = useCallback(async (data: {
    name: string;
    renderedImageUrl: string;
    sourceSketchUrl?: string;
    prompt?: string;
    style?: string;
    designId?: string;
  }): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to save projects');
      return null;
    }

    setIsSaving(true);
    try {
      const { data: inserted, error } = await supabase
        .from('rendered_projects')
        .insert({
          user_id: user.id,
          name: data.name,
          rendered_image_url: data.renderedImageUrl,
          source_sketch_url: data.sourceSketchUrl || null,
          prompt: data.prompt || null,
          style: data.style || null,
          design_id: data.designId || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      toast.success('Project saved!');
      await loadProjects();
      return inserted.id;
    } catch (err) {
      console.error('Failed to save project:', err);
      toast.error('Failed to save project');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, loadProjects]);

  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('rendered_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Project deleted');
      await loadProjects();
      return true;
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
      return false;
    }
  }, [user, loadProjects]);

  const renameProject = useCallback(async (projectId: string, newName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('rendered_projects')
        .update({ name: newName })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Project renamed');
      await loadProjects();
      return true;
    } catch (err) {
      console.error('Failed to rename project:', err);
      toast.error('Failed to rename project');
      return false;
    }
  }, [user, loadProjects]);

  const transferToTailor = useCallback(async (
    projectId: string,
    tailorId: string,
    tailorName: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to transfer projects');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tailor_transfers')
        .insert({
          user_id: user.id,
          rendered_project_id: projectId,
          tailor_id: tailorId,
          tailor_name: tailorName,
          notes: notes || null,
          status: 'pending',
        });

      if (error) throw error;
      toast.success(`Project sent to ${tailorName}!`);
      await loadTransfers();
      return true;
    } catch (err) {
      console.error('Failed to transfer project:', err);
      toast.error('Failed to transfer project');
      return false;
    }
  }, [user, loadTransfers]);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadTransfers();
    }
  }, [user, loadProjects, loadTransfers]);

  return {
    projects,
    transfers,
    isLoading,
    isSaving,
    loadProjects,
    saveProject,
    deleteProject,
    renameProject,
    transferToTailor,
    loadTransfers,
  };
}
