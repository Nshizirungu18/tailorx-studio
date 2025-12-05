import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Download, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Dresses",
  "Shirts",
  "Pants",
  "Jackets",
  "Skirts",
  "Suits",
  "Traditional",
];

const templates = [
  {
    id: 1,
    name: "Elegant Evening Gown",
    category: "Dresses",
    rating: 4.9,
    downloads: 2340,
    isPremium: true,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: 2,
    name: "Classic Business Shirt",
    category: "Shirts",
    rating: 4.7,
    downloads: 1890,
    isPremium: false,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    name: "Modern Slim Fit Pants",
    category: "Pants",
    rating: 4.8,
    downloads: 1560,
    isPremium: false,
    color: "from-gray-500 to-slate-600",
  },
  {
    id: 4,
    name: "Leather Biker Jacket",
    category: "Jackets",
    rating: 4.9,
    downloads: 3120,
    isPremium: true,
    color: "from-amber-600 to-orange-700",
  },
  {
    id: 5,
    name: "A-Line Midi Skirt",
    category: "Skirts",
    rating: 4.6,
    downloads: 980,
    isPremium: false,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 6,
    name: "Three-Piece Suit",
    category: "Suits",
    rating: 4.9,
    downloads: 2780,
    isPremium: true,
    color: "from-slate-700 to-gray-800",
  },
  {
    id: 7,
    name: "Ankara Print Dress",
    category: "Traditional",
    rating: 4.8,
    downloads: 1450,
    isPremium: false,
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: 8,
    name: "Kimono Wrap Jacket",
    category: "Traditional",
    rating: 4.7,
    downloads: 1120,
    isPremium: true,
    color: "from-red-500 to-rose-600",
  },
];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Template <span className="text-gradient-gold">Library</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse professional fashion templates to kickstart your designs.
              Customize and make them your own.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "gold" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                variant="interactive"
                className="group overflow-hidden"
              >
                {/* Template Preview */}
                <div className={cn(
                  "aspect-[3/4] bg-gradient-to-br relative overflow-hidden",
                  template.color
                )}>
                  {/* Placeholder pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                      <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-semibold text-white">
                      Premium
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Button variant="gold">Use Template</Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 truncate">
                    {template.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span>{template.downloads}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
