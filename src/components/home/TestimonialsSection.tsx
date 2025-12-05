import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fashion Designer",
    avatar: "SC",
    content: "TailorX transformed my workflow. The AI assistant helped me refine sketches I've been struggling with for weeks in just minutes.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Custom Clothing Entrepreneur",
    avatar: "MJ",
    content: "Finding reliable tailors used to be my biggest challenge. Now I have a network of verified professionals at my fingertips.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Bridal Designer",
    avatar: "AP",
    content: "The material marketplace is a game-changer. I can source premium fabrics from around the world without leaving my studio.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by <span className="text-gradient-gold">Creators</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of designers and fashion entrepreneurs who trust TailorX 
            for their creative journey.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              variant="elevated"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-primary/30 mb-6" />
                
                {/* Content */}
                <p className="text-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                    <span className="font-semibold text-primary-foreground">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
