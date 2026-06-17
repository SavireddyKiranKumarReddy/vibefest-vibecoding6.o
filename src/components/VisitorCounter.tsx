import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type SiteStats = {
  total_visits: number;
  unique_visitors: number;
  last_updated: string;
};

export function VisitorCounter() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    // Generate or get visitor ID
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("visitor_id", visitorId);
    }

    // Track this visit
    trackVisit(visitorId);

    // Load initial stats
    loadStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("site_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_stats",
        },
        (payload) => {
          console.log("Stats updated:", payload);
          if (payload.new && "total_visits" in payload.new) {
            setStats(payload.new as SiteStats);
            triggerAnimation();
          }
        }
      )
      .subscribe();

    // Show the counter after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);

    return () => {
      clearTimeout(timer);
      channel.unsubscribe();
    };
  }, []);

  async function trackVisit(visitorId: string) {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase.rpc("track_visit", {
        p_visitor_id: visitorId,
        p_page_path: window.location.pathname,
        p_user_agent: navigator.userAgent,
        p_ip_address: null,
      });

      if (error) {
        console.error("Error tracking visit:", error);
      } else if (data) {
        setStats({
          total_visits: data.total_visits,
          unique_visitors: data.unique_visitors,
          last_updated: new Date().toISOString(),
        });
        triggerAnimation();
      }
    } catch (err) {
      console.error("Failed to track visit:", err);
    }
  }

  async function loadStats() {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase.rpc("get_site_stats");

      if (error) {
        console.error("Error loading stats:", error);
      } else if (data) {
        setStats(data as SiteStats);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  function triggerAnimation() {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  }

  if (!isSupabaseConfigured || !stats) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-40 transition-all duration-500 ease-out",
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-full border border-white/10 bg-gradient-to-r from-black/90 to-black/80 backdrop-blur-xl px-5 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.8)]",
          isAnimating && "scale-110 border-india-green/50 shadow-[0_0_28px_-4px_rgba(34,197,94,0.4)]"
        )}
      >
        {/* Eye Icon */}
        <Eye 
          className={cn(
            "size-5 text-india-green transition-all duration-300",
            isAnimating && "scale-125 text-india-green drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
          )} 
        />
        
        {/* Count */}
        <span
          className={cn(
            "font-display text-2xl font-bold tabular-nums text-white transition-all duration-300",
            isAnimating && "text-india-green scale-110"
          )}
        >
          {400 + stats.unique_visitors}
        </span>
      </div>
    </div>
  );
}
