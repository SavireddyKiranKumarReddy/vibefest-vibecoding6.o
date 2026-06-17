import { useEffect, useState } from "react";
import { Users, Eye, TrendingUp } from "lucide-react";
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
    const timer = setTimeout(() => setIsVisible(true), 1000);

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
        p_ip_address: null, // IP will be captured server-side if needed
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
    setTimeout(() => setIsAnimating(false), 600);
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
          "group relative rounded-2xl border border-white/10 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.5)] hover:scale-105",
          isAnimating && "scale-110 border-saffron/40 shadow-[0_0_24px_-4px_rgba(255,153,0,0.4)]"
        )}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-saffron/20 via-transparent to-india-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative p-4 min-w-[240px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-saffron/20 to-india-green/20">
              <TrendingUp className="size-4 text-saffron" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Stats
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-saffron"></span>
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            {/* Total Visits */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 transition-all hover:bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <Eye className="size-3.5 text-saffron/80" />
                <span className="text-xs font-medium text-muted-foreground">Total Visits</span>
              </div>
              <span
                className={cn(
                  "font-display text-lg font-bold tabular-nums transition-all duration-300",
                  isAnimating && "text-saffron scale-110"
                )}
              >
                {stats.total_visits.toLocaleString()}
              </span>
            </div>

            {/* Unique Visitors */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 transition-all hover:bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-india-green/80" />
                <span className="text-xs font-medium text-muted-foreground">Unique</span>
              </div>
              <span className="font-display text-lg font-bold tabular-nums">
                {stats.unique_visitors.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer - Powered by badge */}
          <div className="mt-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider text-muted-foreground/60">
              <span className="tricolor-text font-semibold">VibeCoding 6.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
