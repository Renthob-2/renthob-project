import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Search,
  Shield,
  MessageSquare,
  Building2,
  MapPin,
  ArrowRight,
  ClipboardList,
  Users,
  Eye,
  BarChart3,
  CheckCircle2,
  Briefcase,
  Zap,
  TrendingUp,
  Megaphone,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Search,
    title: "Smart Property Search",
    description: "Filter listings by price, location, property type, and amenities.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "We work to ensure listings are authentic to reduce scams.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Renters can contact landlords or agencies directly through the platform.",
  },
  {
    icon: Building2,
    title: "Property Management Tools",
    description: "Landlords and agencies can manage listings, track inquiries, and update property availability.",
  },
  {
    icon: MapPin,
    title: "Neighborhood Insights",
    description: "View information about the area including amenities, accessibility, and nearby facilities.",
  },
];

const landlordFeatures = [
  {
    icon: ClipboardList,
    title: "Easy Property Listing",
    description: "List your rental property in minutes with photos, pricing, and detailed descriptions.",
  },
  {
    icon: MessageSquare,
    title: "Tenant Inquiries",
    description: "Receive messages from interested renters directly through the platform.",
  },
  {
    icon: Building2,
    title: "Listing Management",
    description: "Edit property details, update pricing, or mark properties as rented anytime.",
  },
  {
    icon: Eye,
    title: "Increased Visibility",
    description: "Your property is exposed to thousands of renters actively searching for homes.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Landlord Profile",
    description: "Build credibility with renters by verifying your profile.",
  },
  {
    icon: BarChart3,
    title: "Property Performance Insights",
    description: "Track how many renters view or inquire about your property.",
  },
];

const agencyFeatures = [
  {
    icon: Building2,
    title: "Manage Multiple Listings",
    description: "Agencies can upload and manage multiple properties from a single dashboard.",
  },
  {
    icon: Users,
    title: "Lead Generation",
    description: "Receive inquiries from renters searching for properties.",
  },
  {
    icon: CheckCircle2,
    title: "Professional Agency Profile",
    description: "Build credibility with a verified agency profile.",
  },
  {
    icon: BarChart3,
    title: "Property Analytics",
    description: "Track listing views and renter interest.",
  },
  {
    icon: Zap,
    title: "Faster Deal Closures",
    description: "Connect directly with serious renters actively searching for homes.",
  },
  {
    icon: Megaphone,
    title: "Brand Visibility",
    description: "Promote your agency and expand your reach in the rental market.",
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
            Renthob provides powerful tools for renters, landlords, and agencies.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Platform Features
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tools designed to make renting simple, secure, and transparent for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature) => (
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
              Landlord Features
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to list, manage, and grow your rental portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landlordFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4">
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

      {/* Agency Features */}
      <section id="agencies" className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-purple-500 text-purple-600 dark:text-purple-400">
              <Briefcase className="h-3 w-3 mr-1" />
              For Agencies
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Agency Features
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Professional tools to manage multiple listings and grow your agency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/signup?role=agent" className="gap-2">
                Join as Agency
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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
            Create your free account today and start exploring everything Renthob has to offer.
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
