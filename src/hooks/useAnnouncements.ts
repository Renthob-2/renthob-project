import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  message: string;
  target_role: string;
  created_at: string;
}

export function useAnnouncements() {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) {
        const filtered = (data as Announcement[]).filter(
          (a) => a.target_role === "all" || a.target_role === role
        );
        setAnnouncements(filtered);
      }
    }
    fetch();
  }, [role]);

  // Load dismissed from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("dismissed_announcements");
    if (stored) {
      setDismissed(new Set(JSON.parse(stored)));
    }
  }, []);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    sessionStorage.setItem("dismissed_announcements", JSON.stringify([...next]));
  };

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  return { announcements: visible, dismiss };
}
