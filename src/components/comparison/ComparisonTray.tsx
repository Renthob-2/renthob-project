import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Scale } from "lucide-react";
import { useComparisonContext } from "@/contexts/ComparisonContext";
import { useComparisonData } from "@/hooks/useComparisonData";
import { ComparisonSheet } from "./ComparisonSheet";
import { cn } from "@/lib/utils";

export function ComparisonTray() {
  const { selectedIds, removeFromCompare, clearComparison } = useComparisonContext();
  const { properties } = useComparisonData(selectedIds);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg",
          "animate-in slide-in-from-bottom duration-300"
        )}
      >
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Property Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
                <Scale className="h-4 w-4" />
                <span>Compare</span>
                <Badge variant="secondary" className="ml-1">
                  {selectedIds.length} of 4
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="relative group shrink-0"
                  >
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="h-12 w-12 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      onClick={() => removeFromCompare(property.id)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${property.title} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={() => setSheetOpen(true)}
                disabled={selectedIds.length < 2}
              >
                Compare Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ComparisonSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
