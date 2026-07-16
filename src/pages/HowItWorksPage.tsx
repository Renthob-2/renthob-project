import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  MessageSquare,
  Home,
  UserPlus,
  ClipboardList,
  Users,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Building2,
  Handshake,
  Zap,
} from "lucide-react";

const renterSteps = [
  {
    icon: Search,
    title: "Search Properties",
    description:
      "Browse active rental listings based on your preferred location, budget, and property type.",
  },
  {
    icon: Eye,
    title: "View Property Details",
    description:
      "See clear photos, pricing, amenities, and neighborhood information before making a decision.",
  },
  {
    icon: MessageSquare,
    title: "Contact the Owner or Agent",
    description:
      "Message the landlord or agency directly through the platform to schedule inspections or ask questions.",
  },
  {
    icon: Home,
    title: "Secure Your Home",
    description:
      "Review the property in person, verify the owner or agent, and agree on rental terms directly.",
  },
];

const landlordSteps = [
  {
    icon: UserPlus,
    title: "Create an Account",
    description: "Sign up and verify your identity.",
  },
  {
    icon: ClipboardList,
    title: "List Your Property",
    description: "Upload photos, property details, and pricing.",
  },
  {
    icon: Users,
    title: "Receive Tenant Requests",
    description: "Interested renters can contact you directly.",
  },
  {
    icon: CheckCircle2,
    title: "Choose the Right Tenant",
    description: "Review inquiries and select qualified renters.",
  },
];

const agencyBenefits = [
  "Create an agency account",
  "Add and manage multiple properties",
  "Connect with renters instantly",
  "Close rental deals faster",
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Renthob Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for a rental, listing your property, or managing multiple listings as an agency, we've made the process simple and stress-free.
          </p>
        </div>
      </section>

      {/* For Renters */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-accent px-3 py-1 rounded-full mb-4">
              <Home className="h-4 w-4" />
              For Renters
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Home
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Finding a home on Renthob is simple and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {renterSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-card rounded-2xl p-6 shadow-card relative z-10">
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/signup?role=tenant" className="gap-2">
                Start Searching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-accent px-3 py-1 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              For Landlords
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Serious Tenants Faster
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Renthob helps property owners find serious tenants faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {landlordSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="bg-card rounded-2xl p-6 shadow-card relative z-10">
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/signup?role=landlord" className="gap-2">
                List Your Property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Agencies */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-full mb-4">
              <Briefcase className="h-4 w-4" />
              For Agencies
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Manage Listings at Scale
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Approved agents can manage multiple listings and connect with renters through Renthob.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-3xl p-8 md:p-10 max-w-2xl mx-auto">
            <ul className="space-y-4 mb-8">
              {agencyBenefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-lg text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link to="/signup?role=agent" className="gap-2">
                  Join as Agency
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join Renthob today and experience the easiest way to rent or list properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/faqs">Read FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
