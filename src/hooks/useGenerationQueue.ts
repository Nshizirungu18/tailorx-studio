import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Generation {
  id: string;
  user_id: string;
  sketch_data: string | null;
  fabric_type: string;
  lighting_style: string;
  detail_level: number;
  agent_type: string;
  additional_notes: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_image: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface GenerationSettings {
  sketchData: string;
  fabricType: string;
  lightingStyle: string;
  detailLevel: number;
  agentType: string;
  additionalNotes?: string;
}

export function useGenerationQueue() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's generations
  const loadGenerations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGenerations((data as Generation[]) || []);
    } catch (err) {
      console.error('Error loading generations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    loadGenerations();

    const channel = supabase
      .channel('generations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGenerations(prev => [payload.new as Generation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGenerations(prev => 
              prev.map(g => g.id === payload.new.id ? payload.new as Generation : g)
            );
            // Show toast on completion
            const gen = payload.new as Generation;
            if (gen.status === 'completed') {
              toast.success('Generation completed!');
            } else if (gen.status === 'failed') {
              toast.error(`Generation failed: ${gen.error_message}`);
            }
          } else if (payload.eventType === 'DELETE') {
            setGenerations(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadGenerations]);

  // Add to queue
  const addToQueue = async (settings: GenerationSettings): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to use the generation queue');
      return null;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          sketch_data: settings.sketchData,
          fabric_type: settings.fabricType,
          lighting_style: settings.lightingStyle,
          detail_level: settings.detailLevel,
          agent_type: settings.agentType,
          additional_notes: settings.additionalNotes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Added to generation queue');
      return data.id;
    } catch (err) {
      console.error('Error adding to queue:', err);
      toast.error('Failed to add to queue');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update generation status (used by processing)
  const updateGeneration = async (id: string, updates: Partial<Generation>) => {
    try {
      const { error } = await supabase
        .from('generations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating generation:', err);
    }
  };

  // Remove from queue
  const removeFromQueue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Removed from queue');
    } catch (err) {
      console.error('Error removing from queue:', err);
      toast.error('Failed to remove');
    }
  };

  // Retry failed generation
  const retryGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .update({ 
          status: 'pending', 
          error_message: null,
          retry_count: supabase.rpc ? 0 : 0 // Reset retry count
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Retrying generation');
    } catch (err) {
      console.error('Error retrying generation:', err);
      toast.error('Failed to retry');
    }
  };

  // Get counts by status
  const pendingCount = generations.filter(g => g.status === 'pending').length;
  const processingCount = generations.filter(g => g.status === 'processing').length;
  const completedCount = generations.filter(g => g.status === 'completed').length;
  const failedCount = generations.filter(g => g.status === 'failed').length;

  return {
    generations,
    isLoading,
    isSubmitting,
    addToQueue,
    updateGeneration,
    removeFromQueue,
    retryGeneration,
    loadGenerations,
    pendingCount,
    processingCount,
    completedCount,
    failedCount
  };
}
