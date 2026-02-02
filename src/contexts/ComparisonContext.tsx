import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = "property-comparison-ids";

interface ComparisonContextType {
  selectedIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  isInComparison: (id: string) => boolean;
  clearComparison: () => void;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const addToCompare = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((existingId) => existingId !== id));
  }, []);

  const isInComparison = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const clearComparison = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const canAddMore = selectedIds.length < MAX_COMPARE_ITEMS;

  return (
    <ComparisonContext.Provider
      value={{
        selectedIds,
        addToCompare,
        removeFromCompare,
        isInComparison,
        clearComparison,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparisonContext() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparisonContext must be used within a ComparisonProvider");
  }
  return context;
}
