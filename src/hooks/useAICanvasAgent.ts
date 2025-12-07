import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasHandle } from "@/components/studio/StudioCanvas";

export interface AIAction {
  id: string;
  type: 'add_template' | 'add_shape' | 'add_text' | 'add_pattern' | 'fill_region' | 'update_element' | 'delete_element' | 'clear_canvas';
  target?: string;
  params?: {
    templateId?: string;
    shapeType?: 'rectangle' | 'circle' | 'line';
    text?: string;
    color?: string;
    pantoneCode?: string;
    pattern?: 'floral' | 'stripes' | 'dots' | 'geometric' | 'lace' | 'plaid';
    size?: number;
    position?: { x: number; y: number };
  };
  preview?: boolean;
  status: 'pending' | 'previewing' | 'applied' | 'rejected';
}

export interface AIActionResult {
  actions: AIAction[];
  explanation: string;
}

interface UseAICanvasAgentReturn {
  pendingActions: AIAction[];
  actionHistory: AIAction[];
  explanation: string;
  isProcessing: boolean;
  error: string | null;
  executePrompt: (prompt: string, context?: string) => Promise<void>;
  applyAction: (actionId: string) => void;
  applyAllActions: () => void;
  rejectAction: (actionId: string) => void;
  rejectAllActions: () => void;
  clearPending: () => void;
}

// Pantone color mapping for common fashion colors
const pantoneColors: Record<string, string> = {
  '17-1463': '#E2583E', // Tangerine Tango
  '15-5519': '#009473', // Emerald
  '18-3224': '#AD5E99', // Radiant Orchid
  '18-1438': '#955251', // Marsala
  '15-3919': '#91A8D0', // Serenity
  '13-1520': '#F7CAC9', // Rose Quartz
  '15-0343': '#88B04B', // Greenery
  '18-3838': '#6B5B95', // Ultra Violet
  '16-1546': '#FF6F61', // Living Coral
  '19-4052': '#0F4C81', // Classic Blue
  '17-5104': '#939597', // Ultimate Gray
  '13-0647': '#F5DF4D', // Illuminating
  '17-3938': '#6667AB', // Very Peri
  '18-1750': '#BE3455', // Viva Magenta
  '13-1023': '#FFBE98', // Peach Fuzz
};

export function useAICanvasAgent(canvasRef: React.RefObject<CanvasHandle>): UseAICanvasAgentReturn {
  const [pendingActions, setPendingActions] = useState<AIAction[]>([]);
  const [actionHistory, setActionHistory] = useState<AIAction[]>([]);
  const [explanation, setExplanation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executePrompt = useCallback(async (prompt: string, context?: string) => {
    setIsProcessing(true);
    setError(null);
    setPendingActions([]);
    setExplanation("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke('design-assistant', {
        body: { prompt, context, mode: 'action' }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data as AIActionResult;
      
      // Add IDs and pending status to actions
      const actionsWithIds: AIAction[] = (result.actions || []).map((action, index) => ({
        ...action,
        id: `action-${Date.now()}-${index}`,
        status: 'pending' as const
      }));

      setPendingActions(actionsWithIds);
      setExplanation(result.explanation || "AI is ready to execute actions");
      
      toast.success(`AI prepared ${actionsWithIds.length} action(s)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process AI command";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const executeAction = useCallback((action: AIAction) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not ready");
      return false;
    }

    try {
      switch (action.type) {
        case 'add_template':
          if (action.params?.templateId) {
            canvas.addTemplate(action.params.templateId);
          }
          break;

        case 'add_shape':
          if (action.params?.shapeType === 'rectangle' || action.params?.shapeType === 'circle') {
            canvas.addShape(action.params.shapeType);
          }
          break;

        case 'add_text':
          canvas.addText();
          break;

        case 'fill_region': {
          let color = action.params?.color || '#000000';
          // Convert Pantone code to hex if provided
          if (action.params?.pantoneCode && pantoneColors[action.params.pantoneCode]) {
            color = pantoneColors[action.params.pantoneCode];
          }
          canvas.fillSelectedRegion(color);
          break;
        }

        case 'clear_canvas':
          canvas.clear();
          break;

        case 'delete_element':
          // For now, we'll handle this by instructing user
          toast.info(`To delete: Select "${action.target}" and press Delete key`);
          break;

        case 'update_element':
          toast.info(`Update action: Modify ${action.target} as instructed`);
          break;

        case 'add_pattern':
          toast.info(`Pattern "${action.params?.pattern}" would be applied to ${action.target}`);
          break;

        default:
          console.warn("Unknown action type:", action.type);
          return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to execute action:", err);
      return false;
    }
  }, [canvasRef]);

  const applyAction = useCallback((actionId: string) => {
    const action = pendingActions.find(a => a.id === actionId);
    if (!action) return;

    const success = executeAction(action);
    
    if (success) {
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      setActionHistory(prev => [...prev, { ...action, status: 'applied' }]);
      toast.success(`Applied: ${action.type.replace('_', ' ')}`);
    }
  }, [pendingActions, executeAction]);

  const applyAllActions = useCallback(() => {
    pendingActions.forEach(action => {
      executeAction(action);
      setActionHistory(prev => [...prev, { ...action, status: 'applied' }]);
    });
    setPendingActions([]);
    toast.success("All actions applied!");
  }, [pendingActions, executeAction]);

  const rejectAction = useCallback((actionId: string) => {
    const action = pendingActions.find(a => a.id === actionId);
    if (!action) return;

    setPendingActions(prev => prev.filter(a => a.id !== actionId));
    setActionHistory(prev => [...prev, { ...action, status: 'rejected' }]);
    toast.info("Action rejected");
  }, [pendingActions]);

  const rejectAllActions = useCallback(() => {
    setActionHistory(prev => [
      ...prev,
      ...pendingActions.map(a => ({ ...a, status: 'rejected' as const }))
    ]);
    setPendingActions([]);
    toast.info("All actions rejected");
  }, [pendingActions]);

  const clearPending = useCallback(() => {
    setPendingActions([]);
    setExplanation("");
  }, []);

  return {
    pendingActions,
    actionHistory,
    explanation,
    isProcessing,
    error,
    executePrompt,
    applyAction,
    applyAllActions,
    rejectAction,
    rejectAllActions,
    clearPending
  };
}
