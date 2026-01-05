import { useState, useEffect, useCallback, useRef } from "react";

interface UseGenerationCooldownReturn {
  cooldownRemaining: number;
  isOnCooldown: boolean;
  startCooldown: (seconds?: number) => void;
  resetCooldown: () => void;
}

const DEFAULT_COOLDOWN = 15;
const MIN_INTERVAL = 10; // Minimum seconds between generations

export function useGenerationCooldown(): UseGenerationCooldownReturn {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const lastGenerationTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearCooldownInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback((seconds: number = DEFAULT_COOLDOWN) => {
    clearCooldownInterval();
    
    // Calculate remaining time considering minimum interval
    const now = Date.now();
    const timeSinceLastGen = (now - lastGenerationTime.current) / 1000;
    const minIntervalRemaining = Math.max(0, MIN_INTERVAL - timeSinceLastGen);
    const actualCooldown = Math.max(seconds, minIntervalRemaining);
    
    setCooldownRemaining(Math.ceil(actualCooldown));
    lastGenerationTime.current = now;

    intervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearCooldownInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCooldownInterval]);

  const resetCooldown = useCallback(() => {
    clearCooldownInterval();
    setCooldownRemaining(0);
  }, [clearCooldownInterval]);

  // Enforce minimum interval even without explicit cooldown
  const enforceMinInterval = useCallback(() => {
    const now = Date.now();
    const timeSinceLastGen = (now - lastGenerationTime.current) / 1000;
    
    if (timeSinceLastGen < MIN_INTERVAL) {
      const remaining = Math.ceil(MIN_INTERVAL - timeSinceLastGen);
      startCooldown(remaining);
      return false;
    }
    
    lastGenerationTime.current = now;
    return true;
  }, [startCooldown]);

  useEffect(() => {
    return () => clearCooldownInterval();
  }, [clearCooldownInterval]);

  return {
    cooldownRemaining,
    isOnCooldown: cooldownRemaining > 0,
    startCooldown,
    resetCooldown,
  };
}
