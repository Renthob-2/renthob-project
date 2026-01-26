import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  FileText,
  MessageSquare,
  Shield,
  CreditCard,
  Building2,
  Users,
  BarChart3,
  FolderOpen,
  Sparkles,
  Brain,
  TrendingUp,
  MapPin,
  ArrowRight,
} from "lucide-react";

const renterFeatures = [
  {
    icon: Search,
    title: "Advanced Property Search",
    description:
      "Filter by location, price, bedrooms, amenities, and more. Find exactly what you need.",
  },
  {
    icon: Heart,
    title: "Save & Compare",
    description:
      "Bookmark your favorite properties and compare them side by side to make the best choice.",
  },
  {
    icon: FileText,
    title: "One-Click Applications",
    description:
      "Apply to multiple properties with a single profile. Track all your applications in one place.",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description:
      "Communicate directly with landlords through our secure in-app messaging system.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "All properties are verified for authenticity. Rent with confidence and peace of mind.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description:
      "Keep track of your rent payments and maintain a complete payment history.",
  },
];

const landlordFeatures = [
  {
    icon: Building2,
    title: "Easy Listing Management",
    description:
      "Create, edit, and manage your property listings with our intuitive dashboard.",
  },
  {
    icon: Users,
    title: "Application Management",
    description:
      "Review applications, view renter profiles, and approve or reject with a single click.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track views, inquiries, and applications for each of your listings.",
  },
  {
    icon: FolderOpen,
    title: "Document Storage",
    description:
      "Store and manage lease agreements, tenant documents, and property records securely.",
  },
  {
    icon: CreditCard,
    title: "Rent Collection",
    description:
      "Track rent payments, send reminders, and maintain complete financial records.",
  },
  {
    icon: MessageSquare,
    title: "Tenant Communication",
    description:
      "Stay connected with tenants through our built-in messaging system.",
  },
];

const aiFeatures = [
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "AI-powered suggestions based on your preferences and search history.",
    status: "Coming Soon",
  },
  {
    icon: TrendingUp,
    title: "Pricing Insights",
    description:
      "Get AI-generated pricing recommendations based on market data and trends.",
    status: "Coming Soon",
  },
  {
    icon: MapPin,
    title: "Neighborhood Analysis",
    description:
      "Detailed insights about neighborhoods including safety, amenities, and lifestyle fit.",
    status: "Coming Soon",
  },
  {
    icon: Brain,
    title: "Smart Matching",
    description:
      "Automatically match renters with properties that best fit their criteria.",
    status: "Coming Soon",
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for Everyone
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From searching properties to managing tenants, Renthob has
            everything you need for a seamless rental experience.
          </p>
        </div>
      </section>

      {/* Renter Features */}
      <section id="renters" className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">For Renters</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Home
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tools designed to make your rental search quick, easy, and
              successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renterFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/signup?role=renter" className="gap-2">
                Start Searching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Landlord Features */}
      <section id="landlords" className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              For Landlords
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Manage Properties with Ease
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to list, manage, and grow your rental
              portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landlordFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-renthob-blue-50 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/signup?role=landlord" className="gap-2">
                List Your Property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Features - Coming Soon */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Smart Features Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're building AI-powered tools to make your rental experience
              even better. Stay tuned!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {aiFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-muted/30 rounded-2xl p-6 border border-border/50 relative overflow-hidden"
              >
                {/* Coming Soon Ribbon */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-xs">
                    {feature.status}
                  </Badge>
                </div>

                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Create your free account today and start exploring everything
            Renthob has to offer.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="bg-background text-foreground hover:bg-background/90"
          >
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
