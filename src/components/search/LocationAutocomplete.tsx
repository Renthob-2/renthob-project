import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface LocationSuggestion {
  label: string;
  type: "location" | "city" | "state";
}

export function LocationAutocomplete({ value, onChange, placeholder = "Search by city, area..." }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allLocations, setAllLocations] = useState<LocationSuggestion[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch unique locations from properties on mount
  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from("properties")
        .select("location, city, state")
        .eq("status", "active");

      if (!data) return;

      const locationSet = new Set<string>();
      const results: LocationSuggestion[] = [];

      data.forEach((p) => {
        if (p.location && !locationSet.has(`loc:${p.location}`)) {
          locationSet.add(`loc:${p.location}`);
          results.push({ label: p.location, type: "location" });
        }
        if (p.city && !locationSet.has(`city:${p.city}`)) {
          locationSet.add(`city:${p.city}`);
          results.push({ label: p.city, type: "city" });
        }
        if (p.state && !locationSet.has(`state:${p.state}`)) {
          locationSet.add(`state:${p.state}`);
          results.push({ label: p.state, type: "state" });
        }
      });

      setAllLocations(results);
    }
    fetchLocations();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const term = value.toLowerCase();
    const filtered = allLocations
      .filter((s) => s.label.toLowerCase().includes(term))
      .slice(0, 8);
    setSuggestions(filtered);
  }, [value, allLocations]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((label: string) => {
    onChange(label);
    setShowSuggestions(false);
  }, [onChange]);

  const typeLabel = (type: string) => {
    switch (type) {
      case "location": return "Area";
      case "city": return "City";
      case "state": return "State";
      default: return "";
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => value.trim() && setShowSuggestions(true)}
        className="pl-9"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.label}-${i}`}
              type="button"
              onClick={() => handleSelect(s.label)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors",
                i === 0 && "rounded-t-md",
                i === suggestions.length - 1 && "rounded-b-md"
              )}
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-xs text-muted-foreground">{typeLabel(s.type)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
