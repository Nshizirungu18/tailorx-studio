import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Palette,
  Shirt,
  Lightbulb,
  Check,
  X,
  Zap,
  History,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Shapes,
  Type,
  Paintbrush,
  Trash2,
  Layers,
  Undo2,
  Send,
  Move,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { useDesignAssistant, AISuggestion } from "@/hooks/useDesignAssistant";
import { AIAction } from "@/hooks/useAICanvasAgent";

interface AIAssistantPanelProps {
  onSuggestionApply: (suggestion: string) => void;
  // AI Agent props
  pendingActions?: AIAction[];
  actionHistory?: AIAction[];
  explanation?: string;
  isProcessing?: boolean;
  onExecutePrompt?: (prompt: string) => void;
  onApplyAction?: (actionId: string) => void;
  onApplyAllActions?: () => void;
  onRejectAction?: (actionId: string) => void;
  onRejectAllActions?: () => void;
  onUndoLastAction?: () => void;
}

const suggestionIconMap = {
  color: Palette,
  style: Shirt,
  detail: Sparkles,
  tip: Lightbulb,
};

const suggestionColorMap = {
  color: "bg-pink-500/20 text-pink-400",
  style: "bg-blue-500/20 text-blue-400",
  detail: "bg-amber-500/20 text-amber-400",
  tip: "bg-green-500/20 text-green-400",
};

const actionIconMap: Record<string, typeof Palette> = {
  add_template: Shirt,
  add_shape: Shapes,
  add_text: Type,
  add_pattern: Layers,
  fill_region: Paintbrush,
  update_color: Palette,
  update_size: Maximize2,
  update_position: Move,
  update_style: Sparkles,
  transform_element: RotateCw,
  delete_element: Trash2,
  delete_selected: Trash2,
  clear_canvas: Trash2,
  apply_gradient: Palette,
  change_background: Layers,
};

const actionColorMap: Record<string, string> = {
  add_template: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  add_shape: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  add_text: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  add_pattern: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  fill_region: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  update_color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  update_size: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  update_position: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  update_style: "bg-green-500/20 text-green-400 border-green-500/30",
  transform_element: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  delete_element: "bg-red-500/20 text-red-400 border-red-500/30",
  delete_selected: "bg-red-500/20 text-red-400 border-red-500/30",
  clear_canvas: "bg-red-500/20 text-red-400 border-red-500/30",
  apply_gradient: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  change_background: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const quickCommands = [
  { label: "Add dress", prompt: "Add a basic dress template to the canvas" },
  { label: "Add croquis", prompt: "Add a female croquis to start sketching" },
  { label: "Fill coral", prompt: "Fill the selected region with living coral color" },
  { label: "Clear canvas", prompt: "Clear everything from the canvas" },
];

export function AIAssistantPanel({ 
  onSuggestionApply,
  pendingActions = [],
  actionHistory = [],
  explanation = "",
  isProcessing = false,
  onExecutePrompt,
  onApplyAction,
  onApplyAllActions,
  onRejectAction,
  onRejectAllActions,
  onUndoLastAction,
}: AIAssistantPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("agent");
  const { suggestions, isLoading, fetchSuggestions } = useDesignAssistant();

  // Fetch initial suggestions
  useEffect(() => {
    if (activeTab === "suggest") {
      fetchSuggestions("Give me design suggestions for starting a fashion sketch");
    }
  }, [activeTab, fetchSuggestions]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a command");
      return;
    }

    if (activeTab === "agent" && onExecutePrompt) {
      onExecutePrompt(prompt);
    } else {
      await fetchSuggestions(prompt);
    }
    setPrompt("");
  };

  const handleQuickCommand = (command: string) => {
    if (onExecutePrompt) {
      onExecutePrompt(command);
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    onSuggestionApply(suggestion.description);
    setAppliedIds(prev => new Set([...prev, suggestion.id]));
    toast.success(`Applied: ${suggestion.title}`);
  };

  const handleRefreshSuggestions = () => {
    fetchSuggestions("Refresh my design suggestions with new creative ideas");
    setAppliedIds(new Set());
  };

  const renderActionDetails = (action: AIAction) => {
    const details: string[] = [];
    
    if (action.target) details.push(`Target: ${action.target}`);
    if (action.params?.templateId) details.push(`Template: ${action.params.templateId}`);
    if (action.params?.shapeType) details.push(`Shape: ${action.params.shapeType}`);
    if (action.params?.pantoneCode) details.push(`Pantone ${action.params.pantoneCode}`);
    if (action.params?.color) details.push(action.params.color);
    if (action.params?.pattern) details.push(`Pattern: ${action.params.pattern}`);
    if (action.params?.size) details.push(`Size: ${action.params.size}%`);
    if (action.params?.rotation) details.push(`Rotate: ${action.params.rotation}°`);
    
    return details;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Chromatique AI</h3>
            <p className="text-xs text-muted-foreground">Full Canvas Control</p>
          </div>
          {onUndoLastAction && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={onUndoLastAction}
              title="Undo last action"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
          <TabsList className="w-full">
            <TabsTrigger value="agent" className="flex-1 gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="suggest" className="flex-1 gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Suggest
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <History className="w-3.5 h-3.5" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quick Commands */}
        {activeTab === "agent" && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickCommands.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleQuickCommand(cmd.prompt)}
                disabled={isProcessing}
                className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        )}

        {/* Prompt Input */}
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === "agent" 
              ? "Create, modify, delete, or color anything... (e.g., 'Add a dress and fill the bodice with coral')"
              : "Ask for design suggestions..."
            }
            className="min-h-[80px] resize-none pr-12"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 h-8 w-8 text-primary hover:text-primary"
            onClick={handleSubmit}
            disabled={isLoading || isProcessing || !prompt.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 mt-2 text-sm text-primary">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        {activeTab === "agent" && (
          <div className="p-4">
            {/* Explanation */}
            {explanation && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Pending Actions */}
            {pendingActions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Actions ({pendingActions.length})
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onApplyAllActions}
                      className="h-6 text-xs text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Apply All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRejectAllActions}
                      className="h-6 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {pendingActions.map((action, index) => {
                  const Icon = actionIconMap[action.type] || Sparkles;
                  const colorClass = actionColorMap[action.type] || "bg-muted text-muted-foreground border-border";
                  const details = renderActionDetails(action);

                  return (
                    <Card
                      key={action.id}
                      className={cn(
                        "p-3 transition-all border",
                        colorClass.split(' ')[2] || 'border-border'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {index + 1}
                          </span>
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            colorClass.split(' ').slice(0, 2).join(' ')
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {action.type.replace(/_/g, ' ')}
                          </p>
                          {details.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {details.map((detail, i) => (
                                <Badge key={i} variant="outline" className="text-xs gap-1">
                                  {detail.startsWith('#') && (
                                    <span 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: detail }}
                                    />
                                  )}
                                  {detail}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => onApplyAction?.(action.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => onRejectAction?.(action.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Skip
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {pendingActions.length === 0 && !explanation && !isProcessing && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Full Canvas Control
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create designs, modify elements, apply colors
                </p>
                <div className="text-left bg-secondary/30 rounded-lg p-3 text-xs space-y-1.5">
                  <p className="font-medium text-foreground">Try commands like:</p>
                  <p className="text-muted-foreground">• "Add a dress template"</p>
                  <p className="text-muted-foreground">• "Fill bodice with Pantone 16-1546"</p>
                  <p className="text-muted-foreground">• "Add a rectangle shape"</p>
                  <p className="text-muted-foreground">• "Clear the canvas"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "suggest" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Smart Suggestions
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshSuggestions}
                disabled={isLoading}
                className="h-6 text-xs"
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ask Chromatique AI for design suggestions
                </p>
              )}
              {suggestions.map((suggestion) => {
                const Icon = suggestionIconMap[suggestion.type] || Lightbulb;
                const colorClass = suggestionColorMap[suggestion.type] || suggestionColorMap.tip;
                const isApplied = appliedIds.has(suggestion.id);

                return (
                  <Card
                    key={suggestion.id}
                    className={cn(
                      "p-3 transition-all",
                      isApplied
                        ? "bg-primary/5 border-primary/20"
                        : "bg-secondary/30 hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        colorClass
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                          {isApplied && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    {!isApplied && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 h-7 text-xs text-primary hover:text-primary"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        Apply Suggestion
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Action History
            </span>

            {actionHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No actions yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Start by giving commands to the AI
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {actionHistory.slice().reverse().map((action) => {
                  const Icon = actionIconMap[action.type] || Sparkles;
                  const details = renderActionDetails(action);
                  
                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        action.status === 'applied' 
                          ? "bg-green-500/10" 
                          : "bg-red-500/10"
                      )}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-foreground capitalize block">
                          {action.type.replace(/_/g, ' ')}
                        </span>
                        {details.length > 0 && (
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {details.join(' • ')}
                          </span>
                        )}
                      </div>
                      {action.status === 'applied' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
