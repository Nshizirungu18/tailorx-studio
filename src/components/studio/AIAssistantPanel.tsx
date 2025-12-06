import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wand2,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Palette,
  Shirt,
  Lightbulb,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useDesignAssistant, AISuggestion } from "@/hooks/useDesignAssistant";

interface AIAssistantPanelProps {
  onSuggestionApply: (suggestion: string) => void;
}

const iconMap = {
  color: Palette,
  style: Shirt,
  detail: Sparkles,
  tip: Lightbulb,
};

const colorMap = {
  color: "bg-pink-500/20 text-pink-400",
  style: "bg-blue-500/20 text-blue-400",
  detail: "bg-amber-500/20 text-amber-400",
  tip: "bg-green-500/20 text-green-400",
};

export function AIAssistantPanel({ onSuggestionApply }: AIAssistantPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const { suggestions, isLoading, fetchSuggestions } = useDesignAssistant();

  // Fetch initial suggestions on mount
  useEffect(() => {
    fetchSuggestions("Give me design suggestions for starting a fashion sketch");
  }, [fetchSuggestions]);

  const handleAskAI = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    await fetchSuggestions(prompt);
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
            <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>

        {/* Prompt Input */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design vision or ask for suggestions..."
          className="min-h-[80px] resize-none mb-3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAskAI();
            }
          }}
        />
        <Button
          variant="gold"
          className="w-full gap-2"
          onClick={handleAskAI}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get AI Suggestions
            </>
          )}
        </Button>
      </div>

      {/* Suggestions Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
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

      {/* Suggestions List */}
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          {suggestions.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ask Chromatique AI for design suggestions
            </p>
          )}
          {suggestions.map((suggestion) => {
            const Icon = iconMap[suggestion.type] || Lightbulb;
            const colorClass = colorMap[suggestion.type] || colorMap.tip;
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
      </ScrollArea>
    </div>
  );
}
