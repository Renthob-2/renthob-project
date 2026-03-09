import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Shield,
  Clock,
  Users,
  Building2,
  Home,
  ArrowRight,
  Loader2,
  Briefcase,
} from "lucide-react";

const PROPERTIES_PER_PAGE = 6;

const stats = [
  { value: "1,000+", label: "Listings" },
  { value: "500+", label: "Renters" },
  { value: "200+", label: "Landlords" },
  { value: "98%", label: "Satisfied" },
];

const benefits = [
  { icon: Shield, title: "Verified Listings", description: "Every property verified for quality." },
  { icon: Clock, title: "Quick Applications", description: "Apply in minutes, not hours." },
  { icon: Users, title: "Direct Messaging", description: "Message landlords securely." },
];

export default function LandingPage() {
  const { properties, loading } = useProperties();
  const [searchLocation, setSearchLocation] = useState("");
  const navigate = useNavigate();

  // Show 6 on desktop (2 rows of 3), 4 on mobile (2 rows of 2)
  const featuredProperties = properties.slice(0, 6);

  return (
    <div>
      {/* Hero Section — compact */}
      <section className="gradient-hero py-8 md:py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 animate-fade-in">
              Find Your Perfect{" "}
              <span className="text-gradient">Rental Home</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-5 animate-fade-in [animation-delay:100ms]">
              Discover rental properties across Nigeria. Connect with trusted landlords instantly.
            </p>

            {/* Search Bar */}
            <div className="bg-card rounded-2xl p-3 shadow-soft animate-fade-in [animation-delay:200ms] relative z-10">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <LocationAutocomplete
                    value={searchLocation}
                    onChange={setSearchLocation}
                    placeholder="Enter city, neighborhood, or address"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-11 px-6 gap-2"
                  onClick={() => navigate(`/search?location=${encodeURIComponent(searchLocation)}`)}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Stats — compact pill row */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-5 animate-fade-in [animation-delay:300ms]">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  {i < stats.length - 1 && (
                    <span className="ml-4 sm:ml-8 text-border hidden sm:inline">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties — dominant section */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Featured Properties
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Hand-picked rentals across Nigeria</p>
            </div>
            <Button variant="ghost" asChild size="sm">
              <Link to="/search" className="gap-1.5">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-xl">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties available yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to list a property on Renthob!</p>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {featuredProperties.length > 0 && (
            <div className="text-center mt-6">
              <Button asChild variant="outline" size="lg">
                <Link to="/search" className="gap-2">
                  Browse All Properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits — compact horizontal strip */}
      <section className="py-6 md:py-8 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-card rounded-xl shadow-card">
                <div className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-accent">
                  <benefit.icon className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xs md:text-sm leading-tight">{benefit.title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5 hidden md:block">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role CTAs — compact 3-col */}
      <section className="py-8 md:py-10">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-accent to-secondary rounded-2xl p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">For Renters</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                Search, save, and apply to properties all in one place.
              </p>
              <Button asChild size="sm" className="self-start">
                <Link to="/signup?role=renter">Start Searching</Link>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-renthob-blue-50 to-accent rounded-2xl p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">For Landlords</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                List your property and connect with qualified renters.
              </p>
              <Button asChild size="sm" className="self-start">
                <Link to="/signup?role=landlord">List Property</Link>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-display text-lg font-bold text-foreground">For Agents</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                Manage listings and grow your real estate business.
              </p>
              <Button asChild size="sm" className="self-start bg-purple-600 hover:bg-purple-700 text-white">
                <Link to="/signup?role=agent">Join as Agent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — slim bar */}
      <section className="py-8 gradient-primary">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">
              Ready to Find Your New Home?
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Join thousands of happy renters and landlords on Renthob.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button size="sm" variant="secondary" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
