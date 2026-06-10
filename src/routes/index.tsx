import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AshokaChakra } from "@/components/AshokaChakra";
import {
  Calendar,
  Users,
  Globe2,
  Rocket,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  Headphones,
  Briefcase,
  Star,
  Network,
  FileCode2,
  Lock,
  Linkedin,
  MessageCircle,
  CheckCircle2,
  Clock,
  Mail,
  ExternalLink,
  Info,
  CalendarDays,
  Gift,
  HelpCircle,
  UserPlus,
} from "lucide-react";

import janPoster from "@/assets/posters/jan.jpg";
import febPoster from "@/assets/posters/feb.jpg";
import marPoster from "@/assets/posters/mar.jpg";
import aprPoster from "@/assets/posters/apr.jpg";
import mayPoster from "@/assets/posters/may.jpg";

// TODO: Replace with the actual Google Form URL when provided.
const GOOGLE_FORM_URL = "https://forms.gle/your-google-form-id";
const LINKEDIN_POST_URL = "https://www.linkedin.com/company/nxtgensec/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeCoding 6.0 — NxtGenSec Monthly Hackathon | June 2026" },
      {
        name: "description",
        content:
          "VibeCoding 6.0 by NxtGenSec — India's monthly online hackathon. Free registration, solo or team up to 4, ₹10,000+ prize pool. Kickoff June 27, 2026.",
      },
      { property: "og:title", content: "VibeCoding 6.0 — NxtGenSec Hackathon" },
      {
        property: "og:description",
        content:
          "Solve real problems. Build fast. Get recognized. Join VibeCoding 6.0 — June 27-28, 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  ["About", "about"],
  ["Problem", "problem"],
  ["Timeline", "timeline"],
  ["Process", "process"],
  ["Benefits", "benefits"],
  ["Past", "past"],
  ["FAQ", "faq"],
];

const MOBILE_NAV = [
  { label: "About", id: "about", icon: Info },
  { label: "Timeline", id: "timeline", icon: CalendarDays },
  { label: "Register", href: GOOGLE_FORM_URL, icon: UserPlus, primary: true },
  { label: "Benefits", id: "benefits", icon: Gift },
  { label: "FAQ", id: "faq", icon: HelpCircle },
];

const TOP_NOTICE =
  "We may pause the VibeCoding continuous hackathons after completion of 6 editions";

function Index() {
  return (
    <div className="min-h-screen pb-24 text-foreground md:pb-0">
      <Nav />
      <MobileBottomNav />
      <Hero />
      <TricolorDivider />
      <About />
      <Problem />
      <Timeline />
      <Process />
      <Benefits />
      <PastHackathons />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function registerLink(className = "") {
  return (
    <a
      href={GOOGLE_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-saffron)] transition hover:brightness-110 ${className}`}
    >
      Register <ExternalLink className="size-4" />
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-xl bg-[oklch(0.13_0.015_260/0.75)] border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="overflow-hidden border-b border-white/5 bg-ink/70 px-4 py-1 text-[8px] font-medium uppercase tracking-[0.28em] text-muted-foreground sm:px-6 sm:text-[9px]">
        <div className="marquee-ltr flex w-max items-center gap-12 whitespace-nowrap">
          <span>{TOP_NOTICE}</span>
          <span aria-hidden="true">{TOP_NOTICE}</span>
          <span aria-hidden="true">{TOP_NOTICE}</span>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 md:py-4">
        <a href="#top" className="group flex min-w-0 items-center gap-2 justify-self-start">
          <div className="relative size-9 rounded-lg tricolor-bar grid place-items-center">
            <div className="absolute inset-0.5 rounded-md bg-ink" />
            <span className="relative text-primary font-bold font-display">N</span>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-display font-bold tracking-tight">NxtGenSec</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              VibeCoding 6.0
            </div>
          </div>
        </a>
        <nav className="hidden items-center justify-center gap-4 text-xs lg:flex lg:gap-7 lg:text-sm">
          {NAV.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-muted-foreground hover:text-foreground transition relative story-link"
            >
              {label}
            </a>
          ))}
        </nav>
        <nav className="hidden items-center justify-center gap-4 text-xs md:flex lg:hidden">
          {NAV.slice(0, 5).map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-muted-foreground hover:text-foreground transition relative story-link"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden justify-self-end md:block">{registerLink()}</div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="relative grid grid-cols-5 items-end overflow-hidden rounded-t-[1.35rem] border border-white/10 border-b-0 bg-[linear-gradient(180deg,oklch(0.19_0.02_260/0.96),oklch(0.12_0.015_260/0.98))] px-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-18px_60px_-24px_oklch(0_0_0/0.95)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const commonClasses = item.primary
            ? "relative -mt-7 flex flex-col items-center gap-0.5 text-primary"
            : "group flex min-w-0 flex-col items-center gap-0.5 rounded-[0.9rem] px-1 py-1 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground";

          if (item.primary) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={commonClasses}
                aria-label="Register for VibeCoding 6.0"
              >
                <span className="grid size-14 place-items-center rounded-[1.2rem] bg-gradient-to-b from-primary via-[#f59e0b] to-[#d97706] text-ink shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--saffron)_80%,transparent)] ring-6 ring-ink-2/95">
                  <Icon className="size-6" strokeWidth={2.5} />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] leading-none text-primary">
                  Register
                </span>
              </a>
            );
          }

          return (
            <a key={item.label} href={`#${item.id}`} className={commonClasses}>
              <span className="grid size-8 place-items-center rounded-xl border border-white/8 bg-white/[0.04] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition group-hover:border-white/15 group-hover:bg-white/[0.07] group-hover:text-primary">
                <Icon className="size-4" strokeWidth={2.1} />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium uppercase tracking-[0.12em] leading-none">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function TricolorDivider() {
  return <div className="h-px tricolor-bar opacity-60" />;
}

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target.getTime()]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

function Hero() {
  const { d, h, m, s } = useCountdown(new Date("2026-06-27T10:00:00+05:30"));
  return (
    <section id="top" className="relative pt-36 pb-24 overflow-hidden grain">
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end pr-0 opacity-[0.07] md:pr-8">
        <AshokaChakra className="chakra-spin h-auto w-[78vw] max-w-[780px] text-chakra" size={780} />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-saffron pulse-glow" />
          India's First Monthly Vibecoding Hackathons
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block">Solve Real Problems.</span>
          <span className="block tricolor-text">Build Fast. Get Recognized.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground">
          VibeCoding 6.0 is the June online hackathon for builders who turn one focused idea
          into a working public web product. Organized by{" "}
          <a href="https://nxtgensec.org" target="_blank" rel="noopener noreferrer" className="text-foreground font-semibold transition hover:text-india-green">NxtGenSec</a> in collaboration
          with <a href="https://www.ignitioninaiera.space" target="_blank" rel="noopener noreferrer" className="text-foreground font-semibold transition hover:text-saffron">IgnitionInAiEra</a>.
        </p>

        <div className="mt-10 inline-flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-card/60 backdrop-blur p-6 shadow-[var(--shadow-elevate)]">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Kickoff in
          </div>
          <div className="flex gap-3 md:gap-5">
            {[
              ["Days", d],
              ["Hours", h],
              ["Mins", m],
              ["Secs", s],
            ].map(([label, val]) => (
              <div
                key={label as string}
                className="min-w-[72px] rounded-xl border border-white/10 bg-ink-2/60 px-3 py-3"
              >
                <div className="font-display text-3xl md:text-4xl font-bold tabular-nums">
                  {String(val).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="size-3.5" /> June 27, 10:00 AM IST · 48-hour sprint
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition shadow-[var(--shadow-saffron)]"
          >
            Register for June 6.0 <ExternalLink className="size-4" />
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
          >
            Explore Hackathon
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          {[
            "Solo / Team up to 4",
            "Free Registration",
            "Prize Pool ₹10,000+",
            "Online Only",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-india-green" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-14">
      <div className="text-[11px] uppercase tracking-[0.3em] text-saffron mb-3">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-5xl font-bold">{title}</h2>
      <div className="mx-auto mt-4 h-[2px] w-28 tricolor-bar rounded-full" />
      {sub && <p className="mt-5 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function About() {
  const items = [
    { icon: Sparkles, title: "Open Innovation Track", text: "Pick a real problem and ship a working web product with clear user value." },
    { icon: Globe2, title: "Online & Accessible", text: "Open to students, professionals, and independent builders from anywhere." },
    { icon: Users, title: "Solo Or Team", text: "Join solo or with a team of up to 4. Keep the team lean and shipping-focused." },
    { icon: Rocket, title: "2-Day Sprint", text: "A 48-hour build window on 27th & 28th June — fast execution, real demos." },
  ];
  return (
    <section id="about" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="About"
          title="About VibeCoding 6.0"
          sub="Open theme, stronger execution: pick a real problem, use modern AI-assisted workflows, and ship a polished web solution people can try."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-saffron/40 hover:shadow-[var(--shadow-saffron)]"
            >
              <div className="size-11 rounded-xl grid place-items-center bg-gradient-to-br from-saffron/20 to-india-green/20 text-saffron mb-4">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              <div className="absolute inset-x-6 bottom-0 h-px tricolor-bar opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section id="problem" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Problem Statement" title="Revealed at Kickoff" />

        <div className="relative overflow-hidden rounded-3xl border border-saffron/30 bg-gradient-to-br from-ink-2 to-ink p-8 md:p-12 shadow-[var(--shadow-elevate)]">
          <div className="absolute -top-20 -right-20 size-80 opacity-10">
            <AshokaChakra className="text-chakra chakra-spin" size={320} />
          </div>
          <div className="relative grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="size-20 rounded-2xl border border-saffron/40 grid place-items-center bg-saffron/10">
              <Lock className="size-9 text-saffron" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-saffron mb-2">
                Drops at kickoff
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                The official problem statement will be announced by{" "}
                <span className="tricolor-text">NxtGenSec</span> at kickoff on June 27, 10:00 AM IST.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Open theme — pick a real problem you care about and ship a publicly deployed,
                usable web product. Judging prioritizes usefulness, execution, clarity, and
                demo quality.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  ["Usefulness", "Solves a real problem people experience"],
                  ["Execution", "Polished, working, deployed publicly"],
                  ["Clarity", "Easy to understand purpose and flow"],
                  ["Demo Quality", "Crisp story and live walkthrough"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="text-sm font-semibold text-foreground">{k}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8">{registerLink()}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  const steps = [
    ["Registration Opens", "June 1"],
    ["Builder Prep Window", "June 8 – 20"],
    ["Registration Closes", "June 25"],
    ["Kickoff — Day 1", "June 27, 10 AM"],
    ["Submission Deadline", "June 28, 11:59 PM"],
    ["Evaluation Period", "June 29 – 30"],
    ["Results Announcement", "July 1"],
  ];
  return (
    <section id="timeline" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Schedule"
          title="Hackathon Timeline"
          sub="June 2026 — every milestone you need to plan around."
        />
        <div className="relative pl-8 md:pl-12">
          <div className="absolute left-2 md:left-4 top-2 bottom-2 w-[3px] rounded-full tricolor-bar" />
          {steps.map(([title, when], i) => (
            <div key={title} className="relative mb-8 last:mb-0 group">
              <div className="absolute -left-[26px] md:-left-[34px] top-1.5 size-4 rounded-full bg-saffron ring-4 ring-ink transition group-hover:scale-125 group-hover:bg-india-green" />
              <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur px-6 py-4 transition hover:border-saffron/40">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-display font-semibold text-lg">
                    <span className="text-muted-foreground mr-3 text-sm tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {title}
                  </div>
                  <div className="text-sm text-saffron font-medium">{when}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    {
      icon: FileCode2,
      title: "Register",
      text: "Submit solo or team details via the Google Form. A team counts as one registration slot.",
      accent: "saffron",
    },
    {
      icon: Linkedin,
      title: "Share The Post",
      text: "Every registered participant MUST repost the official VibeCoding 6.0 announcement on LinkedIn (or another relevant public account).",
      accent: "saffron",
      pill: "Mandatory",
    },
    {
      icon: CheckCircle2,
      title: "Wait For Approval",
      text: "The organizing team verifies your repost. Only approved teams move into the hackathon.",
      accent: "green",
    },
    {
      icon: MessageCircle,
      title: "Join WhatsApp Group",
      text: "After verification, approved participants are added to a dedicated WhatsApp group used for kickoff, support, and final evaluation.",
      accent: "green",
      pill: "After verification",
    },
    {
      icon: Rocket,
      title: "Hackathon Begins",
      text: "Approved teams enter the 48-hour build window and ship a working, publicly deployed project.",
      accent: "saffron",
    },
    {
      icon: Trophy,
      title: "Evaluation & Results",
      text: "Submissions are reviewed for usefulness, execution, clarity, and demo quality. Winners announced July 1.",
      accent: "green",
    },
  ];
  return (
    <section id="process" className="py-24 px-6 bg-gradient-to-b from-transparent via-ink-2/30 to-transparent">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How It Works"
          title="Registration Process"
          sub="Registration is free, but approval is manual after participant checks. Only approved teams move into the hackathon."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => {
            const accent = s.accent === "green" ? "text-india-green" : "text-saffron";
            return (
              <div
                key={s.title}
                className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur p-6 hover:-translate-y-1 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-12 rounded-xl grid place-items-center bg-white/5 ${accent}`}>
                    <s.icon className="size-5" />
                  </div>
                  <div className="font-display text-3xl font-bold text-white/10">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                  {s.pill && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-saffron/40 text-saffron bg-saffron/10">
                      {s.pill}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Trophy, title: "Prize Pool ₹10,000+", front: "Top teams win exciting prizes", back: "Prize money + builder opportunities for top performers across the leaderboard." },
    { icon: Award, title: "Participation Certificate", front: "Verified digital certificate", back: "Every participant receives a signed, verifiable digital certificate of participation." },
    { icon: Sparkles, title: "AI Workflow Recognition", front: "For smart AI-assisted builders", back: "Top builders are recognised for sharp AI-assisted planning, coding, and delivery." },
    { icon: BookOpen, title: "Dev Resources", front: "Templates & launch kits", back: "Curated templates, checklists, and launch resources for all approved participants." },
    { icon: Headphones, title: "Mentor Support", front: "Guidance during the sprint", back: "Get help on scope, product clarity, technical tradeoffs, and final presentation." },
    { icon: Briefcase, title: "Opportunity Pipeline", front: "Internships & collabs", back: "Outstanding participants may be considered for internships and collaboration offers." },
    { icon: Star, title: "Project Showcase", front: "Featured by NxtGenSec", back: "Strong projects are hosted or featured through NxtGenSec community channels." },
    { icon: Trophy, title: "Winner Recognition", front: "Spotlight across community", back: "Top teams get highlighted with prize and certificate support across our network." },
    { icon: Network, title: "Builder Network", front: "Practical, fast-moving devs", back: "Connect with a growing community of shipping-focused Indian builders." },
    { icon: FileCode2, title: "Portfolio Proof", front: "Public repo + live demo", back: "Leave with a public repo, deployed demo, and a real story you can show beyond the event." },
  ];
  return (
    <section id="benefits" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="What You Get"
          title="Benefits"
          sub="Hover any card to see the details on the flip side."
        />

        <div className="rounded-3xl border border-saffron/40 bg-gradient-to-br from-saffron/15 via-white/[0.02] to-india-green/15 p-8 md:p-10 mb-8 text-center shadow-[var(--shadow-saffron)]">
          <div className="text-xs uppercase tracking-[0.3em] text-saffron">Prize Pool Highlight</div>
          <div className="font-display text-5xl md:text-6xl font-bold mt-3 tricolor-text">
            ₹10,000+
          </div>
          <p className="mt-3 text-muted-foreground">
            Top performers win cash prizes plus additional builder opportunities.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((b) => (
            <div key={b.title} className="flip-card h-52">
              <div className="flip-inner">
                <div className="flip-face rounded-2xl border border-white/10 bg-card/70 backdrop-blur p-6 flex flex-col">
                  <div className="size-11 rounded-xl grid place-items-center bg-gradient-to-br from-saffron/25 to-india-green/25 text-saffron mb-auto">
                    <b.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{b.front}</p>
                  </div>
                </div>
                <div className="flip-face flip-back rounded-2xl border border-saffron/40 bg-gradient-to-br from-ink-2 to-ink p-6 flex items-center justify-center text-center shadow-[var(--shadow-saffron)]">
                  <p className="text-sm">{b.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastHackathons() {
  const editions = [
    { name: "January 2026 Poster", mode: "Mode: Individual Participation", winner: "TV Geethika", runner: "B. Manoj Kumar", poster: janPoster },
    { name: "February 2026 Poster", mode: "Mode: Team Based", winner: "GenZ", runner: "TechNova", poster: febPoster },
    { name: "March 2026 Poster", mode: "Mode: Online Hackathon", winner: "Dynamic Duo", runner: "Code Queens", poster: marPoster },
    { name: "April 2026 Poster", mode: "Mode: Team Based - VibeCoding 4.0", winner: "Team Tech Titans", runner: "Cyber Techie", poster: aprPoster },
    { name: "May 2026 Poster", mode: "Mode: Online - VibeCoding 5.0", winner: "Rockers", runner: "Unstoppable", poster: mayPoster },
  ];
  return (
    <section id="past" className="py-24 px-6 bg-gradient-to-b from-transparent via-ink-2/30 to-transparent">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Hall of Fame"
          title="Past Hackathons"
          sub="5 editions completed · 1000+ builders across India · growing every month."
        />
        <div className="overflow-hidden">
          <div className="marquee-left-to-right flex w-max items-stretch gap-5">
            {[...editions, ...editions].map((e, index) => (
              <div
                key={`${e.name}-${index}`}
                className="group w-[250px] shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-card/60 backdrop-blur hover:-translate-y-1 hover:border-saffron/40 transition shadow-[var(--shadow-elevate)] sm:w-[280px]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={e.poster}
                    alt={`${e.name} VibeCoding poster`}
                    loading="lazy"
                    width={832}
                    height={1056}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">
                    {e.mode}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-display font-semibold">{e.name}</div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-3.5 text-saffron" />
                      <span className="text-muted-foreground">Winner</span>
                      <span className="ml-auto font-medium">{e.winner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="size-3.5 text-india-green" />
                      <span className="text-muted-foreground">Runner Up</span>
                      <span className="ml-auto font-medium">{e.runner}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    ["Is there a registration fee to participate?", "No. The June edition is completely free for all accepted participants. There is no registration fee."],
    ["Can I participate as an individual?", "Yes. You can register solo or join with a team of up to 4 — a team counts as one registration slot."],
    ["What is the team size limit?", "Up to 4 members per team. Keep the team lean and shipping-focused."],
    ["What is the problem statement?", "The official problem statement is announced by NxtGenSec at kickoff on June 27, 10:00 AM IST. The hackathon is open-theme — pick a real problem and ship a public web product."],
    ["When does the hackathon start and end?", "Kickoff: June 27, 10:00 AM IST. Submission deadline: June 28, 11:59 PM IST. A 48-hour sprint."],
    ["What should the final submission include?", "A publicly deployed, usable web product + public repository + short demo. Judging prioritises usefulness, execution, clarity, and demo quality."],
    ["Will there be technical support during the hackathon?", "Yes. Approved participants are added to a dedicated WhatsApp group for kickoff, mentor support, and final evaluation."],
    ["What prizes will be awarded?", "A prize pool of ₹10,000+, participation certificates, project showcase, and opportunities for internships and collaborations."],
    ["Is the hackathon online or in-person?", "Fully online. Open to participants from anywhere in India and beyond."],
    ["How will the prize money be distributed?", "Prize distribution is announced after the evaluation period. Details are shared in the WhatsApp group and via official channels."],
  ];
  return (
    <section id="faq" className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
          {faqs.map(([q, a], i) => (
            <AccordionItem
              key={q}
              value={`item-${i}`}
              className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur px-5 data-[state=open]:border-saffron/40 transition"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="text-xs tabular-nums text-saffron font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-10">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-5xl relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16 text-center grain">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/20 via-white/[0.02] to-india-green/20" />
        <div className="absolute -top-32 -right-32 size-96 opacity-10 -z-10">
          <AshokaChakra className="text-chakra chakra-spin" size={384} />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold">
          Ready to build with the{" "}
          <span className="tricolor-text">VibeCoding</span> community?
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Registration is free. Repost the official announcement on LinkedIn, get verified, and
          join the dedicated WhatsApp group for the final evaluation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:brightness-110 transition shadow-[var(--shadow-saffron)]"
          >
            Register on Google Form <ExternalLink className="size-4" />
          </a>
          <a
            href={LINKEDIN_POST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-semibold hover:bg-white/5 transition"
          >
            <Linkedin className="size-4" /> Find LinkedIn Post
          </a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-india-green" /> Free registration</span>
          <span className="flex items-center gap-1.5"><Linkedin className="size-3.5 text-saffron" /> LinkedIn repost required</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="size-3.5 text-india-green" /> WhatsApp group after verification</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-10">
      <div className="h-[3px] tricolor-bar" />
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="relative size-9 rounded-lg tricolor-bar grid place-items-center">
              <div className="absolute inset-0.5 rounded-md bg-ink" />
              <span className="relative text-primary font-bold font-display">N</span>
            </div>
            <div className="font-display font-bold">NxtGenSec</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            NxtGenSec runs focused monthly hackathons where Indian builders solve practical
            problems and ship production-ready ideas.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-saffron mb-3">Quick Links</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAV.map(([label, id]) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:text-foreground transition">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-saffron mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> vibecoding@nxtgensec.org
            </li>
            <li className="flex items-center gap-2">
              <Globe2 className="size-4" /> nxtgensec.org
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="size-4" /> vibecoding.nxtgensec.org
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2026 NxtGenSec. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-foreground">VIBECODING</span>
            <span className="opacity-40">|</span>
            <span>June 6.0 · 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
