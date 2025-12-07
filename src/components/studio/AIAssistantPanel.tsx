import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Play,
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
  update_element: Sparkles,
  delete_element: Trash2,
  clear_canvas: Trash2,
};

const actionColorMap: Record<string, string> = {
  add_template: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  add_shape: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  add_text: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  add_pattern: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  fill_region: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  update_element: "bg-green-500/20 text-green-400 border-green-500/30",
  delete_element: "bg-red-500/20 text-red-400 border-red-500/30",
  clear_canvas: "bg-red-500/20 text-red-400 border-red-500/30",
};

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
      toast.error("Please enter a prompt");
      return;
    }

    if (activeTab === "agent" && onExecutePrompt) {
      onExecutePrompt(prompt);
    } else {
      await fetchSuggestions(prompt);
    }
    setPrompt("");
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

  const formatActionLabel = (action: AIAction) => {
    const parts = [action.type.replace(/_/g, ' ')];
    if (action.target) parts.push(`→ ${action.target}`);
    if (action.params?.color) parts.push(`(${action.params.color})`);
    if (action.params?.pantoneCode) parts.push(`(Pantone ${action.params.pantoneCode})`);
    return parts.join(' ');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Chromatique AI</h3>
            <p className="text-xs text-muted-foreground">Canvas Control Agent</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
          <TabsList className="w-full">
            <TabsTrigger value="agent" className="flex-1 gap-1.5">
              <Bot className="w-3.5 h-3.5" />
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

        {/* Prompt Input */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={activeTab === "agent" 
            ? "Command the canvas... (e.g., 'Add a dress template', 'Fill bodice with coral')"
            : "Ask for design suggestions..."
          }
          className="min-h-[80px] resize-none mb-3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          variant="gold"
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={isLoading || isProcessing}
        >
          {(isLoading || isProcessing) ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {activeTab === "agent" ? "Processing..." : "Thinking..."}
            </>
          ) : (
            <>
              {activeTab === "agent" ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {activeTab === "agent" ? "Execute Command" : "Get Suggestions"}
            </>
          )}
        </Button>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        {activeTab === "agent" && (
          <div className="p-4">
            {/* Explanation */}
            {explanation && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">{explanation}</p>
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
                      className="h-6 text-xs text-green-500 hover:text-green-400"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Apply All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRejectAllActions}
                      className="h-6 text-xs text-red-500 hover:text-red-400"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject All
                    </Button>
                  </div>
                </div>

                {pendingActions.map((action) => {
                  const Icon = actionIconMap[action.type] || Sparkles;
                  const colorClass = actionColorMap[action.type] || "bg-muted text-muted-foreground";

                  return (
                    <Card
                      key={action.id}
                      className={cn(
                        "p-3 transition-all border",
                        colorClass.split(' ')[2] || 'border-border'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          colorClass.split(' ').slice(0, 2).join(' ')
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {action.type.replace(/_/g, ' ')}
                          </p>
                          {action.target && (
                            <p className="text-xs text-muted-foreground">
                              Target: {action.target}
                            </p>
                          )}
                          {action.params && Object.keys(action.params).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {action.params.color && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <span 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: action.params.color }}
                                  />
                                  {action.params.color}
                                </Badge>
                              )}
                              {action.params.pantoneCode && (
                                <Badge variant="outline" className="text-xs">
                                  Pantone {action.params.pantoneCode}
                                </Badge>
                              )}
                              {action.params.pattern && (
                                <Badge variant="outline" className="text-xs">
                                  {action.params.pattern}
                                </Badge>
                              )}
                              {action.params.templateId && (
                                <Badge variant="outline" className="text-xs">
                                  {action.params.templateId}
                                </Badge>
                              )}
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
                          Reject
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
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Tell me what to do with your design
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try: "Add a dress template" or "Fill the bodice with coral"
                </p>
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
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {actionHistory.slice().reverse().map((action) => {
                  const Icon = actionIconMap[action.type] || Sparkles;
                  
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
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-xs text-foreground capitalize">
                        {action.type.replace(/_/g, ' ')}
                        {action.target && ` → ${action.target}`}
                      </span>
                      {action.status === 'applied' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
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
