import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComparisonContext } from "@/contexts/ComparisonContext";
import { useComparisonData } from "@/hooks/useComparisonData";
import { ComparisonTable } from "./ComparisonTable";
import { Skeleton } from "@/components/ui/skeleton";

interface ComparisonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparisonSheet({ open, onOpenChange }: ComparisonSheetProps) {
  const { selectedIds, removeFromCompare, clearComparison } = useComparisonContext();
  const { properties, loading, highlights } = useComparisonData(selectedIds);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-xl">
            Compare Properties ({properties.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : properties.length < 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select at least 2 properties to compare.</p>
            </div>
          ) : (
            <ComparisonTable
              properties={properties}
              highlights={highlights}
              onRemove={removeFromCompare}
              onCloseSheet={() => onOpenChange(false)}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
