import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasHandle } from "@/components/studio/StudioCanvas";

export type AIActionType = 
  | 'add_template' | 'add_shape' | 'add_text' | 'add_pattern'
  | 'fill_region' | 'update_color' | 'update_size' | 'update_position' | 'update_style'
  | 'delete_element' | 'delete_selected' | 'clear_canvas'
  | 'apply_gradient' | 'change_background' | 'transform_element';

export interface AIActionParams {
  templateId?: string;
  shapeType?: 'rectangle' | 'circle' | 'line' | 'triangle';
  text?: string;
  color?: string;
  pantoneCode?: string;
  pattern?: 'floral' | 'stripes' | 'dots' | 'geometric' | 'lace' | 'plaid' | 'houndstooth' | 'paisley';
  size?: number;
  width?: number;
  height?: number;
  position?: { x: number; y: number };
  rotation?: number;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  gradient?: {
    startColor: string;
    endColor: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
  backgroundColor?: string;
  flip?: 'horizontal' | 'vertical';
}

export interface AIAction {
  id: string;
  type: AIActionType;
  target?: string;
  params?: AIActionParams;
  preview?: boolean;
  status: 'pending' | 'previewing' | 'applied' | 'rejected';
}

export interface AIActionResult {
  actions: AIAction[];
  explanation: string;
}

interface CanvasState {
  hasElements: boolean;
  selectedRegion?: string;
  templates: string[];
  currentTool: string;
  stage: string;
}

interface UseAICanvasAgentReturn {
  pendingActions: AIAction[];
  actionHistory: AIAction[];
  explanation: string;
  isProcessing: boolean;
  error: string | null;
  executePrompt: (prompt: string, context?: string, canvasState?: CanvasState) => Promise<void>;
  applyAction: (actionId: string) => void;
  applyAllActions: () => void;
  rejectAction: (actionId: string) => void;
  rejectAllActions: () => void;
  clearPending: () => void;
  undoLastAction: () => void;
}

// Comprehensive Pantone color mapping
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
  // Additional fashion colors
  '11-0601': '#F5F5F5', // Bright White
  '19-4007': '#212121', // Black
  '14-4122': '#9BB7D4', // Airy Blue
  '17-1558': '#D94F70', // Hot Pink
  '18-0107': '#3D5E3A', // Forest Green
  '19-1664': '#9B1B30', // Crimson
  '14-0756': '#F3E779', // Pale Yellow
  '16-3850': '#A0678E', // Mauve
};

// Color name mapping for natural language
const colorNames: Record<string, string> = {
  'coral': '#FF6F61',
  'living coral': '#FF6F61',
  'red': '#E53935',
  'crimson': '#9B1B30',
  'pink': '#E91E63',
  'hot pink': '#D94F70',
  'rose': '#F7CAC9',
  'magenta': '#BE3455',
  'orange': '#FF9800',
  'tangerine': '#E2583E',
  'peach': '#FFBE98',
  'yellow': '#F5DF4D',
  'gold': '#D4AF37',
  'green': '#88B04B',
  'emerald': '#009473',
  'forest green': '#3D5E3A',
  'teal': '#009688',
  'blue': '#0F4C81',
  'navy': '#1A237E',
  'sky blue': '#9BB7D4',
  'serenity': '#91A8D0',
  'purple': '#6B5B95',
  'violet': '#6667AB',
  'orchid': '#AD5E99',
  'lavender': '#B39EB5',
  'brown': '#795548',
  'tan': '#D2B48C',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'white': '#FFFFFF',
  'black': '#000000',
  'gray': '#939597',
  'grey': '#939597',
  'silver': '#C0C0C0',
  'marsala': '#955251',
  'burgundy': '#800020',
  'wine': '#722F37',
  'mauve': '#A0678E',
};

export function useAICanvasAgent(canvasRef: React.RefObject<CanvasHandle>): UseAICanvasAgentReturn {
  const [pendingActions, setPendingActions] = useState<AIAction[]>([]);
  const [actionHistory, setActionHistory] = useState<AIAction[]>([]);
  const [explanation, setExplanation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appliedActionsStack = useRef<AIAction[]>([]);

  // Resolve color from various formats
  const resolveColor = useCallback((params?: AIActionParams): string => {
    if (!params) return '#000000';
    
    // Check for Pantone code first
    if (params.pantoneCode && pantoneColors[params.pantoneCode]) {
      return pantoneColors[params.pantoneCode];
    }
    
    // Check for direct hex color
    if (params.color) {
      // If it's already a hex color
      if (params.color.startsWith('#')) {
        return params.color;
      }
      // Try to match color name
      const lowerColor = params.color.toLowerCase();
      if (colorNames[lowerColor]) {
        return colorNames[lowerColor];
      }
    }
    
    return '#000000';
  }, []);

  const executePrompt = useCallback(async (prompt: string, context?: string, canvasState?: CanvasState) => {
    setIsProcessing(true);
    setError(null);
    setPendingActions([]);
    setExplanation("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke('design-assistant', {
        body: { 
          prompt, 
          context, 
          mode: 'action',
          canvasState 
        }
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
      
      if (actionsWithIds.length > 0) {
        toast.success(`AI prepared ${actionsWithIds.length} action(s)`, {
          description: result.explanation?.slice(0, 60) + '...'
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process AI command";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const executeAction = useCallback((action: AIAction): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not ready");
      return false;
    }

    try {
      switch (action.type) {
        // CREATE Actions
        case 'add_template':
          if (action.params?.templateId) {
            canvas.addTemplate(action.params.templateId);
            toast.success(`Added ${action.params.templateId} template`);
          }
          break;

        case 'add_shape':
          if (action.params?.shapeType === 'rectangle' || action.params?.shapeType === 'circle') {
            canvas.addShape(action.params.shapeType);
            toast.success(`Added ${action.params.shapeType}`);
          }
          break;

        case 'add_text':
          canvas.addText();
          toast.success("Added text element");
          break;

        case 'add_pattern':
          toast.info(`Pattern "${action.params?.pattern}" - This feature is coming soon`);
          break;

        // COLOR Actions  
        case 'fill_region':
        case 'update_color': {
          const color = resolveColor(action.params);
          // If target specifies templateId and regionId, use direct access
          if (action.target && action.target.includes(':')) {
            const [templateId, regionId] = action.target.split(':');
            canvas.fillRegionById(templateId, regionId, color);
          } else if (action.target) {
            // Try to select the region first, then fill
            const elements = canvas.getElements();
            const template = elements.find(el => el.type === 'template');
            if (template && template.colorAreas) {
              // Find matching region name
              const regionId = Object.keys(template.colorAreas).find(
                r => r.toLowerCase().includes(action.target!.toLowerCase())
              );
              if (regionId) {
                canvas.fillRegionById(template.id, regionId, color);
              } else {
                canvas.fillSelectedRegion(color);
              }
            } else {
              canvas.fillSelectedRegion(color);
            }
          } else {
            canvas.fillSelectedRegion(color);
          }
          toast.success(`Applied color ${color}`);
          break;
        }

        case 'apply_gradient':
          toast.info("Gradient fills coming soon");
          break;

        case 'change_background': {
          const bgColor = resolveColor(action.params);
          canvas.setBackgroundColor(bgColor);
          break;
        }

        // MODIFY Actions
        case 'update_size':
          if (action.target) {
            const elements = canvas.getElements();
            const element = elements.find(el => 
              el.id === action.target || el.type === action.target
            );
            if (element) {
              canvas.updateElement(element.id, {
                size: { 
                  width: action.params?.width || (element.size?.width || 100) * ((action.params?.size || 100) / 100),
                  height: action.params?.height || (element.size?.height || 100) * ((action.params?.size || 100) / 100)
                }
              });
              toast.success("Size updated");
            }
          } else {
            toast.info(`Size update: ${action.params?.size}%`);
          }
          break;

        case 'update_position':
          if (action.target && action.params?.position) {
            canvas.updateElement(action.target, { position: action.params.position });
            toast.success("Position updated");
          } else {
            toast.info(`Position update to (${action.params?.position?.x}, ${action.params?.position?.y})`);
          }
          break;

        case 'update_style':
          toast.info("Style update applied");
          break;

        case 'transform_element':
          toast.info(`Transform: ${action.params?.rotation ? `rotate ${action.params.rotation}°` : ''} ${action.params?.flip || ''}`);
          break;

        // DELETE Actions
        case 'delete_element':
          if (action.target) {
            canvas.deleteElement(action.target);
          } else {
            toast.info("Select an element to delete");
          }
          break;

        case 'delete_selected':
          canvas.deleteSelected();
          break;

        case 'clear_canvas':
          canvas.clear();
          toast.success("Canvas cleared");
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
  }, [canvasRef, resolveColor]);

  const applyAction = useCallback((actionId: string) => {
    const action = pendingActions.find(a => a.id === actionId);
    if (!action) return;

    const success = executeAction(action);
    
    if (success) {
      const appliedAction = { ...action, status: 'applied' as const };
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      setActionHistory(prev => [...prev, appliedAction]);
      appliedActionsStack.current.push(appliedAction);
    }
  }, [pendingActions, executeAction]);

  const applyAllActions = useCallback(() => {
    const successfulActions: AIAction[] = [];
    
    pendingActions.forEach(action => {
      const success = executeAction(action);
      if (success) {
        successfulActions.push({ ...action, status: 'applied' as const });
      }
    });
    
    setActionHistory(prev => [...prev, ...successfulActions]);
    appliedActionsStack.current.push(...successfulActions);
    setPendingActions([]);
    
    if (successfulActions.length > 0) {
      toast.success(`Applied ${successfulActions.length} action(s)!`);
    }
  }, [pendingActions, executeAction]);

  const rejectAction = useCallback((actionId: string) => {
    const action = pendingActions.find(a => a.id === actionId);
    if (!action) return;

    setPendingActions(prev => prev.filter(a => a.id !== actionId));
    setActionHistory(prev => [...prev, { ...action, status: 'rejected' }]);
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

  const undoLastAction = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.undo();
    const lastAction = appliedActionsStack.current.pop();
    if (lastAction) {
      toast.info(`Undid: ${lastAction.type.replace(/_/g, ' ')}`);
    }
  }, [canvasRef]);

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
    clearPending,
    undoLastAction
  };
}
