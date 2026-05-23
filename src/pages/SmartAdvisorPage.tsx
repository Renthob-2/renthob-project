import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MapPin, Bed, Bath, Search, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Exact filtering criteria extracted from the layout image
const budgetFilters = [
  { label: "₦200k – ₦500k", value: { min: 200000, max: 500000 } },
  { label: "₦500k – ₦1M", value: { min: 500000, max: 1000000 } },
  { label: "₦1M – ₦3M", value: { min: 1000000, max: 3000000 } },
  { label: "₦3M+", value: { min: 3000000, max: 50000000 } },
];

const locations = [
  "Yaba", "Lekki", "Surulere", "Ikeja", "Abuja", 
  "Gbagada", "Port Harcourt", "Ibadan", "Enugu", "Onitsha"
];

const lifestyles = [
  { label: "Quiet", emoji: "🤫" },
  { label: "Social", emoji: "🎉" },
  { label: "Work proximity", emoji: "💼" },
  { label: "Affordable", emoji: "💰" },
  { label: "Family-friendly", emoji: "👨‍👩‍👧‍👦" },
  { label: "Safe & Secure", emoji: "🔒" }
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
  const [selectedBudget, setSelectedBudget] = useState<{ min: number; max: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdvisorResult[]>([]);
  const [summary, setSummary] = useState("");
  const [filters, setFilters] = useState<any>(null);

  const handleSubmit = async () => {
    // Construct search parameters based on active tags if query string is short
    let finalQuery = query.trim();
    if (!finalQuery && (selectedLocation || selectedLifestyle)) {
      finalQuery = `Looking for a home in ${selectedLocation || "Nigeria"} with a ${selectedLifestyle || "good"} lifestyle environment.`;
    }

    if (!finalQuery) {
      toast.error("Please describe your ideal home or select quick filter tags.");
      return;
    }

    setLoading(true);
    setResults([]);
    setSummary("");

    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error("Request timed out. Please verify your Edge Function server logs.");
      }
    }, 10000);

    try {
      const { data, error } = await supabase.functions.invoke("rental-advisor", {
        body: { 
          query: finalQuery, 
          budget: selectedBudget?.max || 3000000,
          filters: {
            location: selectedLocation,
            lifestyle: selectedLifestyle,
            minBudget: selectedBudget?.min
          }
        },
      });
      
      clearTimeout(timeoutId);

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      
      setResults(data.results || []);
      setSummary(data.summary || "");
      setFilters(data.filters || null);
      
      if (!data.results?.length) {
        toast.info("No matching properties found. Try selecting different criteria.");
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("Advisor network exception:", e);
      toast.error(e.message || "Advisor configuration or response failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/10">
      <div className="container mx-auto px-4 py-12 max-w-4xl flex flex-col items-center">
        
        {/* Main Hero Header Layout Elements */}
        <div className="text-center max-w-2xl mt-4 mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">
            Find the right home for your <span className="text-[#3B82F6]">life</span> and income.
          </h1>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Describe what you need or use the quick filters below. Our AI will find the best neighborhoods and available listings for you.
          </p>
        </div>

        {/* Dynamic Search Box Input Row */}
        <div className="w-full max-w-3xl relative mb-8">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-primary/50 transition-all p-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I need a 2-bed flat in Lekki under ₦1.5M..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 text-base placeholder:text-slate-400 w-full pl-3 pr-12"
            />
            <div className="absolute right-36 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer p-1">
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg px-5 h-11 shadow-sm transition-colors shrink-0 ml-auto flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Find Homes</span>
            </Button>
          </div>
        </div>

        {/* Advanced Meta Filters Wrapper Container */}
        <div className="w-full max-w-3xl space-y-6 text-left mb-10 px-1">
          {/* Budget Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">BUDGET (YEARLY)</h4>
            <div className="flex flex-wrap gap-2">
              {budgetFilters.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setSelectedBudget(selectedBudget?.max === b.value.max ? null : b.value)}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                    selectedBudget?.max === b.value.max
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">LOCATION</h4>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                  className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                    selectedLocation === loc
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">LIFESTYLE</h4>
            <div className="flex flex-wrap gap-2">
              {lifestyles.map((style) => (
                <button
                  key={style.label}
                  type="button"
                  onClick={() => setSelectedLifestyle(selectedLifestyle === style.label ? null : style.label)}
                  className={`text-xs font-medium px-4 py-2 rounded-full border flex items-center gap-1.5 transition-all ${
                    selectedLifestyle === style.label
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span>{style.emoji}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button Section Alignment */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full">
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            size="lg" 
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-medium px-8 py-6 shadow-md shadow-blue-500/10 flex items-center gap-2 text-sm"
          >
            <Sparkles className="h-4 w-4 fill-white/20" />
            <span>{loading ? "Finding matches..." : "Get AI Recommendations"}</span>
          </Button>
          <button 
            type="button"
            className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors py-2 px-4 border border-transparent hover:border-slate-100 rounded-xl"
          >
            Take the Quiz Instead
          </button>
        </div>

        {/* Extra Footer Anchor Info Links */}
        <div className="text-center text-xs text-slate-400 space-y-2 pt-4 border-t border-slate-100 w-full max-w-3xl">
          <p className="hover:text-slate-600 transition-colors cursor-pointer font-medium">Browse all available homes →</p>
          <p className="tracking-wide">Built with <span className="text-emerald-500 font-bold">NG</span> for Nigerians everywhere</p>
        </div>

        {/* Layout Results Feed Component Output Segment */}
        <div className="w-full max-w-3xl mt-12 text-left">
          {loading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && summary && (
            <Card className="mb-8 border-blue-100 bg-blue-50/50 rounded-xl shadow-none">
              <CardContent className="py-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}

          {!loading && results.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.map(({ property: p, reasons }) => (
                <Card
                  key={p.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-all rounded-xl border-slate-200/80 bg-white"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"}
                      alt={p.title}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-bold tracking-tight text-slate-900">{formatNaira(Number(p.price))}</span>
                      <span className="text-xs text-slate-400 font-medium">/{p.price_period || "year"}</span>
                    </div>
                    <h3 className="font-semibold text-base line-clamp-1 text-slate-800">{p.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{p.address || `${p.location}, Nigeria`}</span>
                    </div>
                    <div className="flex gap-3 text-xs font-medium text-slate-500 mt-3.5">
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <Bed className="h-3.5 w-3.5 text-slate-400" /> {p.bedrooms || 0} Beds
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <Bath className="h-3.5 w-3.5 text-slate-400" /> {p.bathrooms || 0} Baths
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}