import { Link } from "react-router-dom";
import { Scissors, Sparkles, Instagram, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Digital Studio", href: "/studio" },
    { label: "Templates", href: "/templates" },
    { label: "AI Assistant", href: "/studio" },
    { label: "Pricing", href: "/" },
  ],
  marketplace: [
    { label: "Find Tailors", href: "/tailors" },
    { label: "Materials", href: "/materials" },
    { label: "Become a Tailor", href: "/tailors" },
    { label: "Sell Materials", href: "/materials" },
  ],
  company: [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Blog", href: "/" },
    { label: "Contact", href: "/" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
    { label: "Cookie Policy", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gradient-dark border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Scissors className="w-8 h-8 text-primary" />
                <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Tailor<span className="text-gradient-gold">X</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              The future of fashion design and production, powered by AI.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Marketplace</h4>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 TailorX. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ♥ for fashion designers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
