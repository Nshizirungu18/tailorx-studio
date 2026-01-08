import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BackendHealthState {
  isHealthy: boolean | null; // null = checking
  lastChecked: Date | null;
  error: string | null;
}

export function useBackendHealth(checkInterval = 30000) {
  const [state, setState] = useState<BackendHealthState>({
    isHealthy: null,
    lastChecked: null,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke("health", {
        body: {},
      });

      if (error) {
        setState({
          isHealthy: false,
          lastChecked: new Date(),
          error: error.message || "Backend unreachable",
        });
      } else {
        setState({
          isHealthy: true,
          lastChecked: new Date(),
          error: null,
        });
      }
    } catch (err) {
      setState({
        isHealthy: false,
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : "Connection failed",
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Periodic checks
    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return { ...state, recheckHealth: checkHealth };
}
