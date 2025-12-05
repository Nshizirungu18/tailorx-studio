import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle,
  Clock,
  MessageCircle,
} from "lucide-react";

const specializations = [
  "All",
  "Bridal",
  "Business",
  "Casual",
  "Traditional",
  "Evening Wear",
  "Streetwear",
];

const tailors = [
  {
    id: 1,
    name: "Amara Okonkwo",
    avatar: "AO",
    location: "Lagos, Nigeria",
    specialization: "Traditional",
    rating: 4.9,
    reviews: 234,
    completedOrders: 450,
    responseTime: "< 1 hour",
    verified: true,
    startingPrice: 150,
  },
  {
    id: 2,
    name: "Chen Wei Studio",
    avatar: "CW",
    location: "Shanghai, China",
    specialization: "Business",
    rating: 4.8,
    reviews: 189,
    completedOrders: 380,
    responseTime: "< 2 hours",
    verified: true,
    startingPrice: 200,
  },
  {
    id: 3,
    name: "Isabella Rossi",
    avatar: "IR",
    location: "Milan, Italy",
    specialization: "Evening Wear",
    rating: 5.0,
    reviews: 156,
    completedOrders: 290,
    responseTime: "< 3 hours",
    verified: true,
    startingPrice: 350,
  },
  {
    id: 4,
    name: "Marcus Johnson",
    avatar: "MJ",
    location: "New York, USA",
    specialization: "Streetwear",
    rating: 4.7,
    reviews: 278,
    completedOrders: 520,
    responseTime: "< 1 hour",
    verified: true,
    startingPrice: 120,
  },
  {
    id: 5,
    name: "Priya Sharma",
    avatar: "PS",
    location: "Mumbai, India",
    specialization: "Bridal",
    rating: 4.9,
    reviews: 312,
    completedOrders: 410,
    responseTime: "< 2 hours",
    verified: true,
    startingPrice: 280,
  },
  {
    id: 6,
    name: "Kofi Mensah",
    avatar: "KM",
    location: "Accra, Ghana",
    specialization: "Traditional",
    rating: 4.8,
    reviews: 145,
    completedOrders: 260,
    responseTime: "< 4 hours",
    verified: true,
    startingPrice: 100,
  },
];

export default function Tailors() {
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTailors = tailors.filter((tailor) => {
    const matchesSpec =
      selectedSpecialization === "All" || tailor.specialization === selectedSpecialization;
    const matchesSearch = tailor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your <span className="text-gradient-gold">Perfect Tailor</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with skilled artisans worldwide. Every tailor is verified
              and rated by our community.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tailors..."
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

          {/* Specializations */}
          <div className="flex gap-2 flex-wrap mb-8">
            {specializations.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpecialization === spec ? "gold" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialization(spec)}
              >
                {spec}
              </Button>
            ))}
          </div>

          {/* Tailors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTailors.map((tailor) => (
              <Card key={tailor.id} variant="interactive" className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white">
                      {tailor.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {tailor.name}
                        </h3>
                        {tailor.verified && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {tailor.location}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                        {tailor.specialization}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        {tailor.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tailor.reviews} reviews
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">
                        {tailor.completedOrders}
                      </div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
                        <Clock className="w-3 h-3" />
                        {tailor.responseTime}
                      </div>
                      <div className="text-xs text-muted-foreground">Response</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">From </span>
                      <span className="font-display font-bold text-xl text-gradient-gold">
                        ${tailor.startingPrice}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="gold" size="sm">
                        View Profile
                      </Button>
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
