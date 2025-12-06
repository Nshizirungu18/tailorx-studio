import { useState } from "react";
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

interface AIAssistantPanelProps {
  onSuggestionApply: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  type: 'color' | 'style' | 'detail' | 'tip';
  title: string;
  description: string;
  icon: React.ElementType;
}

const sampleSuggestions: Suggestion[] = [
  {
    id: '1',
    type: 'color',
    title: 'Seasonal Color Match',
    description: 'Consider adding muted terracotta tones for the F/W 2025 trend alignment.',
    icon: Palette,
  },
  {
    id: '2',
    type: 'style',
    title: 'Silhouette Enhancement',
    description: 'The A-line skirt would benefit from a slightly higher waistline for modern proportions.',
    icon: Shirt,
  },
  {
    id: '3',
    type: 'detail',
    title: 'Detail Refinement',
    description: 'Add subtle topstitching along the collar for a more polished finish.',
    icon: Sparkles,
  },
  {
    id: '4',
    type: 'tip',
    title: 'Pro Tip',
    description: 'Use the airbrush tool at 20% opacity for realistic fabric shading.',
    icon: Lightbulb,
  },
];

export function AIAssistantPanel({ onSuggestionApply }: AIAssistantPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(sampleSuggestions);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const handleAskAI = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("AI suggestions updated!");
    setIsLoading(false);
    setPrompt("");
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    onSuggestionApply(suggestion.description);
    setAppliedIds(prev => new Set([...prev, suggestion.id]));
    toast.success(`Applied: ${suggestion.title}`);
  };

  const handleRefreshSuggestions = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuggestions([...sampleSuggestions].sort(() => Math.random() - 0.5));
      setIsLoading(false);
      toast.success("Suggestions refreshed!");
    }, 1000);
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
            <h3 className="font-display font-semibold text-foreground">AI Design Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Chromatique AI</p>
          </div>
        </div>

        {/* Prompt Input */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design vision or ask for suggestions..."
          className="min-h-[80px] resize-none mb-3"
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
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
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
                    suggestion.type === 'color' && "bg-pink-500/20 text-pink-400",
                    suggestion.type === 'style' && "bg-blue-500/20 text-blue-400",
                    suggestion.type === 'detail' && "bg-amber-500/20 text-amber-400",
                    suggestion.type === 'tip' && "bg-green-500/20 text-green-400",
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
