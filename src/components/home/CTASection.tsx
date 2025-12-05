import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-copper/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Start Free Today</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Ready to Transform Your
            <span className="text-gradient-gold"> Fashion Journey?</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join TailorX today and discover a world where creativity meets craftsmanship. 
            Your next masterpiece is just a click away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/studio">
              <Button variant="hero" size="xl" className="group">
                Create Your First Design
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/tailors">
              <Button variant="glass" size="xl">
                Explore Tailors
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <p className="text-muted-foreground text-sm mt-8">
            No credit card required • Free tier available • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
