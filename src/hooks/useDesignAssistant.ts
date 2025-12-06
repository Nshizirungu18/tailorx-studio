import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AISuggestion {
  id: string;
  type: 'color' | 'style' | 'detail' | 'tip';
  title: string;
  description: string;
}

interface UseDesignAssistantReturn {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (prompt: string, context?: string) => Promise<void>;
  clearSuggestions: () => void;
}

export function useDesignAssistant(): UseDesignAssistantReturn {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (prompt: string, context?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('design-assistant', {
        body: { prompt, context }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const newSuggestions: AISuggestion[] = (data.suggestions || []).map(
        (s: Omit<AISuggestion, 'id'>, index: number) => ({
          ...s,
          id: `ai-${Date.now()}-${index}`
        })
      );

      setSuggestions(newSuggestions);
      toast.success("AI suggestions updated!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get AI suggestions";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions
  };
}
