import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2, MapPin, Bed, Bath } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type IncomeBracket = "entry-level" | "mid-career" | "senior-professional" | "business-owner";

const incomeBrackets: { value: IncomeBracket; label: string; range: string }[] = [
  { value: "entry-level", label: "Entry Level", range: "₦50k - ₦200k/mo" },
  { value: "mid-career", label: "Mid Career", range: "₦200k - ₦500k/mo" },
  { value: "senior-professional", label: "Senior Professional", range: "₦500k - ₦1.5M/mo" },
  { value: "business-owner", label: "Business Owner", range: "₦1.5M+/mo" },
];

const examplePrompts = [
  "3-bedroom flat in Lekki under ₦5M/year with borehole and 24/7 security",
  "Quiet self-contain in Yaba near public transport, good for work from home",
  "Family duplex in Gwarinpa Abuja with parking and good neighborhood",
];

const formatNaira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : `₦${n.toLocaleString()}`;

interface AdvisorResult {
  property: any;
  score: number;
  reasons: string[];
}

export default function SmartAdvisorPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState<number>(2_000_000);
  const [income, setIncome] = useState<IncomeBracket | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdvisorResult[]>([]);
  const [summary, setSummary] = useState("");
  const [filters, setFilters] = useState<any>(null);

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast.error("Tell us what you're looking for");
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("rental-advisor", {
        body: { query, budget, incomeBracket: income },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResults(data.results || []);
      setSummary(data.summary || "");
      setFilters(data.filters || null);
      if (!data.results?.length) toast.info("No matching properties yet. Try broadening your request.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Advisor failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <BackButton />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Smart Rental Advisor</h1>
          <p className="text-muted-foreground mt-2">
            Describe your ideal home in plain English — we'll match you to verified listings.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5 text-primary" /> What are you looking for?
            </CardTitle>
            <CardDescription>Mention location, budget, bedrooms, must-haves, lifestyle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 2-bedroom apartment in Lekki Phase 1 under ₦4M/year, must have borehole, 24/7 security, and good for working from home"
              className="min-h-[110px]"
            />

            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setQuery(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="budget">Max yearly budget (₦)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  min={50000}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">{formatNaira(budget)} per year</p>
              </div>
              <div>
                <Label>Income level (optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {incomeBrackets.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setIncome(income === b.value ? null : b.value)}
                      className={`p-2 rounded-md border text-left text-xs transition ${
                        income === b.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{b.label}</div>
                      <div className="text-muted-foreground">{b.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full">
              {loading ? "Finding matches..." : "Find my matches"}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        )}

        {!loading && summary && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">{summary}</p>
              </div>
              {filters && Object.keys(filters).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(filters).map(([k, v]) =>
                    v == null || (Array.isArray(v) && !v.length) ? null : (
                      <Badge key={k} variant="secondary" className="text-xs">
                        {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                      </Badge>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {results.map(({ property: p, reasons }) => (
              <Card
                key={p.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/property/${p.id}`)}
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={p.images?.[0] || "/placeholder.svg"}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold">{formatNaira(Number(p.price))}</span>
                    <span className="text-xs text-muted-foreground">/{p.price_period}</span>
                  </div>
                  <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {p.location}, {p.city}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" /> {p.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" /> {p.bathrooms}
                    </span>
                  </div>
                  {reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                      {reasons.slice(0, 4).map((r, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] py-0">
                          ✓ {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
