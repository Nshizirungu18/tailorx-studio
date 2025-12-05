import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, ShoppingCart, Heart, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Cotton",
  "Silk",
  "Linen",
  "Wool",
  "Velvet",
  "Denim",
  "Leather",
];

const materials = [
  {
    id: 1,
    name: "Premium Egyptian Cotton",
    category: "Cotton",
    price: 25,
    unit: "per yard",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    color: "bg-gradient-to-br from-white to-gray-100",
    supplier: "Cairo Textiles",
  },
  {
    id: 2,
    name: "Mulberry Silk Charmeuse",
    category: "Silk",
    price: 85,
    unit: "per yard",
    rating: 5.0,
    reviews: 89,
    inStock: true,
    color: "bg-gradient-to-br from-rose-100 to-pink-200",
    supplier: "Shanghai Silk Co.",
  },
  {
    id: 3,
    name: "Irish Linen Premium",
    category: "Linen",
    price: 45,
    unit: "per yard",
    rating: 4.8,
    reviews: 112,
    inStock: true,
    color: "bg-gradient-to-br from-amber-50 to-yellow-100",
    supplier: "Dublin Mills",
  },
  {
    id: 4,
    name: "Merino Wool Suiting",
    category: "Wool",
    price: 65,
    unit: "per yard",
    rating: 4.7,
    reviews: 78,
    inStock: false,
    color: "bg-gradient-to-br from-gray-300 to-slate-400",
    supplier: "Yorkshire Wool",
  },
  {
    id: 5,
    name: "Crushed Velvet",
    category: "Velvet",
    price: 55,
    unit: "per yard",
    rating: 4.9,
    reviews: 134,
    inStock: true,
    color: "bg-gradient-to-br from-purple-400 to-violet-500",
    supplier: "Lyon Fabrics",
  },
  {
    id: 6,
    name: "Japanese Selvedge Denim",
    category: "Denim",
    price: 35,
    unit: "per yard",
    rating: 4.8,
    reviews: 201,
    inStock: true,
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    supplier: "Okayama Denim",
  },
  {
    id: 7,
    name: "Italian Full Grain Leather",
    category: "Leather",
    price: 120,
    unit: "per sq ft",
    rating: 5.0,
    reviews: 67,
    inStock: true,
    color: "bg-gradient-to-br from-amber-700 to-orange-800",
    supplier: "Tuscany Leathers",
  },
  {
    id: 8,
    name: "Organic Cotton Twill",
    category: "Cotton",
    price: 18,
    unit: "per yard",
    rating: 4.6,
    reviews: 189,
    inStock: true,
    color: "bg-gradient-to-br from-green-50 to-emerald-100",
    supplier: "Eco Textiles",
  },
];

export default function Materials() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMaterials = materials.filter((material) => {
    const matchesCategory =
      selectedCategory === "All" || material.category === selectedCategory;
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Material <span className="text-gradient-gold">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Source premium fabrics from verified suppliers worldwide.
              Quality guaranteed.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
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

          {/* Materials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                variant="interactive"
                className="group overflow-hidden"
              >
                {/* Material Preview */}
                <div className={cn("aspect-square relative", material.color)}>
                  {/* Fabric texture overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.03) 2px,
                        rgba(0,0,0,0.03) 4px
                      )`
                    }} />
                  </div>

                  {/* Stock Badge */}
                  {!material.inStock && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                      Out of Stock
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Add */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                    <Button variant="gold" size="sm" className="w-full gap-2" disabled={!material.inStock}>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    {material.supplier}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 truncate">
                    {material.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>{material.rating}</span>
                      <span className="text-xs">({material.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="w-3 h-3" />
                      Free shipping
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-xl text-gradient-gold">
                      ${material.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {material.unit}
                    </span>
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
