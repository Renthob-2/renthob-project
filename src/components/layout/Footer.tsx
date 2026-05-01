import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  company: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/features", label: "Features" },
    { href: "/faqs", label: "FAQs" },
    { href: "/faqs#general", label: "About Us" },
  ],
  forRenters: [
    { href: "/search", label: "Search Properties" },
    { href: "/signup?role=renter", label: "Create Account" },
    { href: "/faqs#renters", label: "Renter FAQ" },
  ],
  forLandlords: [
    { href: "/signup?role=landlord", label: "List Your Property" },
    { href: "/features#landlords", label: "Landlord Features" },
    { href: "/faqs#landlords", label: "Landlord FAQ" },
  ],
  forAgencies: [
    { href: "/signup?role=agent", label: "Join as Agency" },
    { href: "/features#agencies", label: "Agency Features" },
    { href: "/faqs#agencies", label: "Agency FAQ" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Renthob" className="h-10" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Making rental searching simple and stress-free. Find your perfect
              home or list your property with ease.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@renthob.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Renters */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              For Renters
            </h3>
            <ul className="space-y-3">
              {footerLinks.forRenters.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-display font-semibold text-foreground mb-4 mt-8">
              For Landlords
            </h3>
            <ul className="space-y-3">
              {footerLinks.forLandlords.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Agencies */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              For Agencies
            </h3>
            <ul className="space-y-3">
              {footerLinks.forAgencies.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Renthob. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
