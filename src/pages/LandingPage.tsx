import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Shield,
  Clock,
  Users,
  Building2,
  Home,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const stats = [
  { value: "1,000+", label: "Active Listings" },
  { value: "500+", label: "Happy Renters" },
  { value: "200+", label: "Trusted Landlords" },
  { value: "98%", label: "Satisfaction Rate" },
];

const benefits = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every property is verified for quality and authenticity.",
  },
  {
    icon: Clock,
    title: "Quick Applications",
    description: "Apply to multiple properties in minutes, not hours.",
  },
  {
    icon: Users,
    title: "Direct Communication",
    description: "Message landlords directly through our secure platform.",
  },
];

export default function LandingPage() {
  const { properties, loading } = useProperties();
  
  // Get first 3 properties as featured (or show empty state)
  const featuredProperties = properties.slice(0, 3);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Find Your Perfect{" "}
              <span className="text-gradient">Rental Home</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in [animation-delay:100ms]">
              Discover thousands of rental properties. Connect with trusted
              landlords. Move into your dream home with ease.
            </p>

            {/* Search Bar */}
            <div className="bg-card rounded-2xl p-4 shadow-soft animate-fade-in [animation-delay:200ms]">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter city, neighborhood, or address"
                    className="pl-10 h-12 border-border/50"
                  />
                </div>
                <Button size="lg" className="h-12 px-8 gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 animate-fade-in [animation-delay:300ms]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Featured Properties
              </h2>
              <p className="text-muted-foreground max-w-md">
                Hand-picked rentals that match what renters are looking for.
              </p>
            </div>
            <Button variant="ghost" asChild className="mt-4 md:mt-0">
              <Link to="/search" className="gap-2">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties available yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to list a property on Renthob!
              </p>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Renthob?
            </h2>
            <p className="text-muted-foreground">
              We make the rental experience simple, secure, and stress-free for
              everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card rounded-2xl p-6 shadow-card text-center"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent mb-4">
                  <benefit.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Renters & Landlords */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Renters */}
            <div className="bg-gradient-to-br from-accent to-secondary rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  For Renters
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Find your perfect rental home in minutes. Search, save, and
                apply to properties all in one place.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse thousands of verified listings",
                  "Save favorites and compare properties",
                  "Submit applications online",
                  "Message landlords directly",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link to="/signup?role=renter">Start Searching</Link>
              </Button>
            </div>

            {/* For Landlords */}
            <div className="bg-gradient-to-br from-renthob-blue-50 to-accent rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  For Landlords
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                List your property and connect with qualified renters. Manage
                everything from one dashboard.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Create and manage listings easily",
                  "Receive and review applications",
                  "Track payments and tenants",
                  "Communicate with renters securely",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link to="/signup?role=landlord">List Your Property</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 gradient-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Find Your New Home?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of happy renters and landlords on Renthob today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
