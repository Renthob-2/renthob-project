import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnnouncementsBanner() {
  const { announcements, dismiss } = useAnnouncements();

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {announcements.map((ann) => (
        <div
          key={ann.id}
          className="relative flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
          <Megaphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground">{ann.title}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-0.5">{ann.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(ann.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={() => dismiss(ann.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
