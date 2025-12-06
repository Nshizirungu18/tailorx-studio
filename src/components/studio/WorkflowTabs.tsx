import { cn } from "@/lib/utils";
import { WorkflowStage } from "./types";
import { Palette, PenTool, Sparkles, ImageIcon, Presentation } from "lucide-react";

interface WorkflowTabsProps {
  currentStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
}

const stages: { id: WorkflowStage; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'color', label: 'Color', icon: Palette, description: 'Inspiration & Palettes' },
  { id: 'sketch', label: 'Sketch', icon: PenTool, description: 'Foundation & Templates' },
  { id: 'detail', label: 'Detail', icon: Sparkles, description: 'Creative Refinement' },
  { id: 'refine', label: 'Refine', icon: ImageIcon, description: 'Photo Enhancement' },
  { id: 'present', label: 'Present', icon: Presentation, description: 'Export & Share' },
];

export function WorkflowTabs({ currentStage, onStageChange }: WorkflowTabsProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl">
      {stages.map((stage, index) => {
        const isActive = stage.id === currentStage;
        const isPast = index < currentIndex;
        const Icon = stage.icon;

        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
              "text-sm font-medium",
              isActive && "bg-primary text-primary-foreground shadow-gold",
              !isActive && isPast && "text-primary hover:bg-secondary",
              !isActive && !isPast && "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{stage.label}</span>
            {index < stages.length - 1 && (
              <div className={cn(
                "hidden lg:block w-8 h-px ml-2",
                isPast ? "bg-primary" : "bg-border"
              )} />
            )}
          </button>
        );
      })}
    </div>
  );
}
