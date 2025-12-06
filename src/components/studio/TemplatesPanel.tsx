import { useState } from "react";
import { cn } from "@/lib/utils";
import { garmentTemplates, templateCategories } from "./data/templates";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight } from "lucide-react";

interface TemplatesPanelProps {
  onTemplateSelect: (templateId: string) => void;
}

export function TemplatesPanel({ onTemplateSelect }: TemplatesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = garmentTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className={cn(
                "group p-4 cursor-pointer transition-all duration-300",
                "bg-secondary/30 hover:bg-secondary/50",
                "hover:shadow-lg hover:scale-[1.02]",
                "border border-border/50 hover:border-primary/30"
              )}
            >
              <div className="aspect-square flex items-center justify-center mb-2 text-4xl opacity-70 group-hover:opacity-100 transition-opacity">
                {template.thumbnail}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate">
                  {template.name}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm text-muted-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground/70">Try adjusting your search</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
