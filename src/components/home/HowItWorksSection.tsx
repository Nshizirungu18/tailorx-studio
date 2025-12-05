import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Design Your Vision",
    description: "Use our digital studio to sketch your designs or let AI help you create stunning fashion concepts from scratch.",
  },
  {
    number: "02",
    title: "Choose Materials",
    description: "Browse our curated marketplace of premium fabrics and materials. Compare prices and quality from verified suppliers.",
  },
  {
    number: "03",
    title: "Find Your Tailor",
    description: "Connect with skilled tailors who specialize in your style. Review portfolios, ratings, and pricing.",
  },
  {
    number: "04",
    title: "Track & Receive",
    description: "Monitor your order's progress in real-time. From cutting to finishing, stay informed every step of the way.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps from concept to creation. We handle the complexity 
            so you can focus on your creativity.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="relative z-10">
                {/* Step Number */}
                <div className="font-display text-6xl font-bold text-gradient-gold opacity-30 mb-4">
                  {step.number}
                </div>
                
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/studio">
            <Button variant="gold" size="lg" className="group">
              Start Your First Design
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
