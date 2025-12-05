import { Card, CardContent } from "@/components/ui/card";
import { 
  Palette, 
  Wand2, 
  Users, 
  Layers, 
  Truck, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Digital Studio",
    description: "Advanced canvas tools with layers, shapes, and precision drawing for professional fashion design.",
  },
  {
    icon: Wand2,
    title: "AI Design Assistant",
    description: "Let AI refine your sketches, suggest patterns, and generate production-ready designs instantly.",
  },
  {
    icon: Users,
    title: "Tailor Network",
    description: "Connect with verified professional tailors worldwide to bring your designs to life.",
  },
  {
    icon: Layers,
    title: "Material Library",
    description: "Browse thousands of fabrics and materials from trusted suppliers with real-time pricing.",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    description: "Track your orders from production to delivery with real-time updates and notifications.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Every tailor is vetted, every material is verified. Your designs are in safe hands.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <span className="text-gradient-gold"> Create</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From concept to creation, TailorX provides all the tools and connections 
            you need to turn your fashion vision into reality.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="interactive"
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 group-hover:animate-pulse-gold transition-all">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
