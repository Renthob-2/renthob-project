import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties, type SearchProperty } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { findLocalAdvisorMatches } from "@/lib/advisor";

interface AdvisorResult {
  property?: { id?: string };
  score?: number;
  reasons?: string[];
}

interface AdvisorResponse {
  error?: string;
  summary?: string;
  results?: AdvisorResult[];
}

export default function SmartAdvisorPage() {
  const { properties, loading } = useProperties();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProperty[]>([]);
  const [summary, setSummary] = useState("");
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const findHomes = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast.error("Tell us what kind of home you need");
      return;
    }

    setSearching(true);
    setHasSearched(true);
    const fallbackResults = findLocalAdvisorMatches(properties, trimmedQuery);

    try {
      const { data, error } = await supabase.functions.invoke<AdvisorResponse>("rental-advisor", {
        body: { query: trimmedQuery },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const propertyById = new Map(properties.map((property) => [property.id, property]));
      const allowedIds = new Set(fallbackResults.map((property) => property.id));
      const serverMatches = (data?.results ?? [])
        .map((item) => item.property?.id ? propertyById.get(item.property.id) : undefined)
        .filter((property): property is SearchProperty => Boolean(property && allowedIds.has(property.id)));
      const verifiedMatches = serverMatches.length > 0 ? serverMatches : fallbackResults;
      setResults(verifiedMatches);
      setSummary(
        verifiedMatches.length > 0
          ? `Found ${verifiedMatches.length} active ${verifiedMatches.length === 1 ? "listing" : "listings"} matching your stated requirements.`
          : "No current listing closely matches that request. Try a broader location or budget.",
      );
    } catch (error) {
      console.warn("AI advisor backend unavailable; using local matching.", error);
      setResults(fallbackResults);
      setSummary(
        fallbackResults.length > 0
          ? "Here are the closest available matches. Renthob used on-site matching because the online advisor is temporarily unavailable."
          : "No current listing closely matches that request. Try a broader location or budget.",
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Find a home in plain English</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Describe your preferred location, budget, bedrooms and important amenities. Renthob will rank the closest active listings.
          </p>
        </div>

        <Card className="mx-auto mt-8 max-w-3xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">What are you looking for?</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void findHomes();
              }}
            >
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Example: a 2-bedroom apartment in Akure under ₦2 million"
                aria-label="Describe the home you need"
                disabled={searching}
              />
              <Button type="submit" disabled={searching || loading} className="sm:min-w-36">
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                {searching ? "Searching…" : "Find Homes"}
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              {["2-bedroom in Akure", "Ikeja under ₦30 million", "Gated apartment with parking"].map((example) => (
                <button
                  key={example}
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {hasSearched && (
          <section className="mt-12" aria-live="polite">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold">Recommended homes</h2>
                <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
              </div>
              <Link className="text-sm font-medium text-primary hover:underline" to="/search">Browse all available homes</Link>
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((property) => <PropertyCard key={property.id} property={property} />)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="font-medium">No close matches are available yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try removing an amenity, increasing the budget or searching a nearby area.</p>
                  <Button asChild variant="outline" className="mt-4"><Link to="/search">Open detailed filters</Link></Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
