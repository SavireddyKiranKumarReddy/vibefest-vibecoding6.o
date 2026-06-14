import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AshokaChakra } from "@/components/AshokaChakra";
import { RegistrationDialog, openRegistrationDialog } from "@/components/RegistrationSection";
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
  Home,
  CalendarRange,
  Gem,
  HelpCircle,
  UserPlus,
} from "lucide-react";

import nxtGenSecLogo from "@/assets/nxtgensec-logo.png";
import janPoster from "@/assets/posters/january-2026.jpg";
import febPoster from "@/assets/posters/february-2026.jpg";
import marPoster from "@/assets/posters/march-2026.jpg";
import aprPoster from "@/assets/posters/april-2026.jpeg";
import mayPoster from "@/assets/posters/may-2026.jpeg";

const LINKEDIN_POST_URL = "https://www.linkedin.com/company/nxtgensec/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeCoding Hackathon 6.0 - NxtGenSec (Next Generation Security) | July 2026" },
      {
        name: "description",
        content:
          "VibeCoding Hackathon 6.0 by NxtGenSec (Next Generation Security) is the July 2026 online hackathon. Registration starts June 1. Build on July 25, 26, and 27. Final submission is due July 27 at 11:49 PM IST.",
      },
      {
        property: "og:title",
        content: "VibeCoding Hackathon 6.0 - NxtGenSec (Next Generation Security)",
      },
      {
        property: "og:description",
        content:
          "Solve real problems. Build fast. Get recognized. Join VibeCoding Hackathon 6.0 from July 25-27, 2026.",
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
  ["Past Hackathons", "past"],
  ["FAQ", "faq"],
];

const MOBILE_NAV = [
  { label: "Home", href: "#top", icon: Home },
  { label: "Timeline", href: "#timeline", icon: CalendarRange },
  { label: "Register", icon: UserPlus, primary: true },
  { label: "Benefits", href: "#benefits", icon: Gem },
  { label: "FAQs", href: "#faq", icon: HelpCircle },
];

function Index() {
  return (
    <div className="min-h-screen pb-24 text-foreground md:pb-0">
      <Nav />
      <MobileBottomNav />
      <RegistrationDialog />
      <Hero />
      <TricolorDivider />
      <About />
      <Problem />
      <Timeline />
      <Process />
      <Benefits />
      <Collaborators />
      <PastHackathonsShowcase />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function registerLink(className = "") {
  return (
    <button
      type="button"
      onClick={openRegistrationDialog}
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-saffron)] transition hover:brightness-110 ${className}`}
    >
      Register <UserPlus className="size-4" />
    </button>
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
          ? "backdrop-blur-xl bg-[oklch(0.13_0.015_260/0.75)] shadow-[0_18px_50px_-32px_oklch(0_0_0/0.9)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:py-4">
        <a href="#top" className="group flex min-w-0 items-center gap-2 justify-self-start">
          <img
            src={nxtGenSecLogo}
            alt="NxtGenSec (Next Generation Security) logo"
            width={40}
            height={40}
            className="size-10 rounded-lg bg-black object-contain p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          />
          <div className="min-w-0 leading-none">
            <div className="font-display text-sm font-bold tracking-tight sm:text-base">
              NxtGenSec
            </div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">
              Next Generation Security
            </div>
            <div className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-saffron sm:text-[9px]">
              Securing Digital Assets
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
      <div className="relative grid h-[76px] grid-cols-5 items-center overflow-hidden rounded-t-2xl border border-white/10 border-b-0 bg-[linear-gradient(180deg,oklch(0.19_0.02_260/0.98),oklch(0.115_0.014_260/0.99))] px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_60px_-24px_oklch(0_0_0/0.95)] backdrop-blur-2xl">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const commonClasses = item.primary
            ? "relative flex h-full flex-col items-center justify-center gap-1 text-primary"
            : "group flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground";

          if (item.primary) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={openRegistrationDialog}
                className={commonClasses}
                aria-label="Register for VibeCoding 6.0"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-b from-primary via-[#f59e0b] to-[#d97706] text-ink shadow-[0_16px_34px_-18px_color-mix(in_oklab,var(--saffron)_80%,transparent)] ring-1 ring-white/30">
                  <Icon className="size-5" strokeWidth={2.4} />
                </span>
                <span className="text-[9px] font-semibold uppercase leading-none text-primary">
                  Register
                </span>
              </button>
            );
          }

          return (
            <a key={item.label} href={item.href} className={commonClasses}>
              <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition group-hover:border-white/15 group-hover:bg-white/[0.07] group-hover:text-primary">
                <Icon className="size-[17px]" strokeWidth={2.15} />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium uppercase leading-none">
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
  const { d, h, m, s } = useCountdown(new Date("2026-07-25T10:00:00+05:30"));
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-24 md:pt-32 grain">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <AshokaChakra
          className="chakra-spin h-auto w-[92vw] max-w-[780px] text-chakra"
          size={780}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-saffron pulse-glow" />
          India's First Monthly Vibecoding Hackathons
        </div>
        <h1 className="mt-6 font-display text-[clamp(1.15rem,5.8vw,4.5rem)] font-bold leading-[1.06] sm:text-[clamp(3rem,5.5vw,4.5rem)]">
          <span className="block whitespace-nowrap">Solve Real Problems.</span>
          <span className="block whitespace-nowrap tricolor-text">Build Fast. Get Recognized.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground">
          VibeCoding Hackathon 6.0 is the July online hackathon for builders who turn one focused
          idea into a working public web product. Organized by{" "}
          <a
            href="https://nxtgensec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-semibold transition hover:text-india-green"
          >
            NxtGenSec (Next Generation Security)
          </a>
          .
        </p>

        <div className="mt-10 inline-flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-card/60 backdrop-blur p-6 shadow-[var(--shadow-elevate)]">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Kickoff in
          </div>
          <div className="grid w-full max-w-sm grid-cols-4 gap-2 md:max-w-none md:flex md:gap-5">
            {[
              ["Days", d],
              ["Hours", h],
              ["Mins", m],
              ["Secs", s],
            ].map(([label, val]) => (
              <div
                key={label as string}
                className="min-w-0 rounded-xl border border-white/10 bg-ink-2/60 px-2 py-3 md:min-w-[72px] md:px-3"
              >
                <div className="font-display text-2xl font-bold tabular-nums md:text-4xl">
                  {String(val).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="size-3.5" /> July 25-27, 2026 · Final submission: July 27, 11:49 PM
            IST
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={openRegistrationDialog}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition shadow-[var(--shadow-saffron)]"
          >
            Register for July 6.0 <UserPlus className="size-4" />
          </button>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
          >
            Explore Hackathon
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          {["Solo / Team up to 4", "Free Registration", "Prize Pool ₹10,000+", "Online Only"].map(
            (f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-india-green" />
                {f}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
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
    {
      icon: Sparkles,
      title: "Open Innovation Track",
      text: "Pick a real problem and ship a working web product with clear user value.",
    },
    {
      icon: Globe2,
      title: "Online & Accessible",
      text: "Open to students, professionals, and independent builders from anywhere.",
    },
    {
      icon: Users,
      title: "Solo Or Team",
      text: "Join solo or with a team of up to 4. Keep the team lean and shipping-focused.",
    },
    {
      icon: Rocket,
      title: "3-Day Sprint",
      text: "Build across July 25, 26, and 27, then submit your project by July 27 at 11:49 PM IST.",
    },
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
                <span className="tricolor-text">NxtGenSec (Next Generation Security)</span> at
                kickoff on July 25, 10:00 AM IST.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Open theme — pick a real problem you care about and ship a publicly deployed, usable
                web product. Judging prioritizes usefulness, execution, clarity, and demo quality.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  ["Usefulness", "Solves a real problem people experience"],
                  ["Execution", "Polished, working, deployed publicly"],
                  ["Clarity", "Easy to understand purpose and flow"],
                  ["Demo Quality", "Crisp story and live walkthrough"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
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
    ["Builder Prep Window", "July 8-24"],
    ["Hackathon Day 1", "July 25"],
    ["Hackathon Day 2", "July 26"],
    ["Hackathon Day 3", "July 27"],
    ["Final Submission", "July 27, 11:49 PM"],
    ["Evaluation Period", "July 28-29"],
    ["Final Result Announcement", "July 31"],
  ];
  return (
    <section id="timeline" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Schedule"
          title="Hackathon Timeline"
          sub="July 2026 - every milestone you need to plan around."
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
      text: "Submit solo or team details through the registration form. A team counts as one registration slot.",
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
      text: "Approved teams build across July 25, 26, and 27, then submit a working, publicly deployed project.",
      accent: "saffron",
    },
    {
      icon: Trophy,
      title: "Evaluation & Results",
      text: "Submissions are reviewed on July 28-29 for usefulness, execution, clarity, and demo quality. Final results are announced July 31.",
      accent: "green",
    },
  ];
  return (
    <section
      id="process"
      className="py-24 px-6 bg-gradient-to-b from-transparent via-ink-2/30 to-transparent"
    >
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
                  <div
                    className={`size-12 rounded-xl grid place-items-center bg-white/5 ${accent}`}
                  >
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
    {
      icon: Trophy,
      title: "Prize Pool ₹10,000+",
      front: "Top teams win exciting prizes",
      back: "Prize money + builder opportunities for top performers across the leaderboard.",
    },
    {
      icon: Award,
      title: "Participation Certificate",
      front: "Verified digital certificate",
      back: "Every participant receives a signed, verifiable digital certificate of participation.",
    },
    {
      icon: Sparkles,
      title: "AI Workflow Recognition",
      front: "For smart AI-assisted builders",
      back: "Top builders are recognised for sharp AI-assisted planning, coding, and delivery.",
    },
    {
      icon: BookOpen,
      title: "Dev Resources",
      front: "Templates & launch kits",
      back: "Curated templates, checklists, and launch resources for all approved participants.",
    },
    {
      icon: Headphones,
      title: "Mentor Support",
      front: "Guidance during the sprint",
      back: "Get help on scope, product clarity, technical tradeoffs, and final presentation.",
    },
    {
      icon: Briefcase,
      title: "Opportunity Pipeline",
      front: "Internships & collabs",
      back: "Outstanding participants may be considered for internships and collaboration offers.",
    },
    {
      icon: Star,
      title: "Project Showcase",
      front: "Featured by NxtGenSec (Next Generation Security)",
      back: "Strong projects are hosted or featured through NxtGenSec (Next Generation Security) community channels.",
    },
    {
      icon: Trophy,
      title: "Winner Recognition",
      front: "Spotlight across community",
      back: "Top teams get highlighted with prize and certificate support across our network.",
    },
    {
      icon: Network,
      title: "Builder Network",
      front: "Practical, fast-moving devs",
      back: "Connect with a growing community of shipping-focused Indian builders.",
    },
    {
      icon: FileCode2,
      title: "Portfolio Proof",
      front: "Public repo + live demo",
      back: "Leave with a public repo, deployed demo, and a real story you can show beyond the event.",
    },
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
          <div className="text-xs uppercase tracking-[0.3em] text-saffron">
            Prize Pool Highlight
          </div>
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

function Collaborators() {
  const collaborators = [
    { name: "IgnitionInAiEra", logo: "IA", tone: "from-saffron/35 to-india-green/25" },
    { name: "Builder Circle", logo: "BC", tone: "from-chakra/35 to-saffron/25" },
    { name: "AI Launchpad", logo: "AI", tone: "from-india-green/35 to-chakra/25" },
    { name: "Code Campus", logo: "CC", tone: "from-saffron/30 to-chakra/25" },
    { name: "Startup Studio", logo: "SS", tone: "from-india-green/30 to-saffron/25" },
  ];

  return (
    <section id="collaborators" className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Network" title="Collaborators" />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/35 p-3 shadow-[var(--shadow-elevate)]">
          <div className="marquee-collaborators-ltr flex w-max items-stretch gap-4">
            {[...collaborators, ...collaborators].map((c, index) => (
              <div
                key={`${c.name}-${index}`}
                className="grid w-[170px] shrink-0 place-items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-5 text-center shadow-[var(--shadow-elevate)] backdrop-blur transition hover:-translate-y-1 hover:border-saffron/40 sm:w-[200px]"
              >
                <div
                  className={`grid size-16 place-items-center rounded-2xl bg-gradient-to-br ${c.tone} text-lg font-bold text-foreground ring-1 ring-white/10 sm:size-20 sm:text-xl`}
                >
                  {c.logo}
                </div>
                <div className="min-h-10 text-sm font-semibold leading-tight sm:text-base">
                  {c.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PastHackathonsShowcase() {
  const editions = [
    {
      name: "January 2026",
      mode: "Individual Participation",
      winner: "TV Geethika",
      runner: "B. Manoj Kumar",
      poster: janPoster,
      note: "The opening edition focused on individual builders proving product clarity, speed, and working demos.",
    },
    {
      name: "February 2026",
      mode: "Team Based",
      winner: "GenZ",
      runner: "TechNova",
      poster: febPoster,
      note: "Teams collaborated on practical web ideas with stronger execution and presentation quality.",
    },
    {
      name: "March 2026",
      mode: "Online Hackathon",
      winner: "Dynamic Duo",
      runner: "Code Queens",
      poster: marPoster,
      note: "The online edition expanded reach and brought in fast-moving builders from different cities.",
    },
    {
      name: "April 2026",
      mode: "Team Based - VibeCoding 4.0",
      winner: "Team Tech Titans",
      runner: "Cyber Techie",
      poster: aprPoster,
      note: "VibeCoding 4.0 pushed teams toward sharper problem framing and public project demos.",
    },
    {
      name: "May 2026",
      mode: "Online - VibeCoding 5.0",
      winner: "Rockers",
      runner: "Unstoppable",
      poster: mayPoster,
      note: "The fifth edition strengthened the monthly builder community and celebrated consistent shipping.",
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = editions[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % editions.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, [editions.length]);

  return (
    <section
      id="past"
      className="py-20 px-6 bg-gradient-to-b from-transparent via-ink-2/30 to-transparent"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Hall of Fame"
          title="Past Hackathons"
          sub="Past editions, standout builders, and the momentum behind the VibeCoding community."
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,1fr)] lg:items-stretch">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/35 p-2.5 shadow-[var(--shadow-elevate)]">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {editions.map((e) => (
                <div key={e.name} className="w-full shrink-0 px-1">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="grid h-[330px] place-items-center sm:h-[390px] lg:h-[430px]">
                      <img
                        src={e.poster}
                        alt={`${e.name} VibeCoding poster`}
                        loading="lazy"
                        width={832}
                        height={1056}
                        className="size-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-2">
              {editions.map((e, index) => (
                <button
                  key={e.name}
                  type="button"
                  aria-label={`Show ${e.name}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index ? "w-8 bg-saffron" : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-5 shadow-[var(--shadow-elevate)] backdrop-blur md:p-6">
            <div className="absolute -right-20 -top-20 size-60 opacity-10">
              <AshokaChakra className="text-chakra chakra-spin" size={240} />
            </div>
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.24em] text-saffron">
                Active Edition
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">{active.name}</h3>
              <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {active.mode}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{active.note}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <Trophy className="size-4 text-saffron" />
                    Winner
                  </div>
                  <div className="mt-2 font-display text-lg font-semibold leading-tight">
                    {active.winner}
                  </div>
                </div>
                <div className="rounded-xl border border-india-green/30 bg-india-green/10 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <Award className="size-4 text-india-green" />
                    Runner Up
                  </div>
                  <div className="mt-2 font-display text-lg font-semibold leading-tight">
                    {active.runner}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  <CheckCircle2 className="size-4 text-india-green" />
                  Public demos
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  <CheckCircle2 className="size-4 text-india-green" />
                  Strong execution
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  <CheckCircle2 className="size-4 text-india-green" />
                  Builder network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PastHackathons() {
  const editions = [
    {
      name: "January 2026 Poster",
      mode: "Mode: Individual Participation",
      winner: "TV Geethika",
      runner: "B. Manoj Kumar",
      poster: janPoster,
    },
    {
      name: "February 2026 Poster",
      mode: "Mode: Team Based",
      winner: "GenZ",
      runner: "TechNova",
      poster: febPoster,
    },
    {
      name: "March 2026 Poster",
      mode: "Mode: Online Hackathon",
      winner: "Dynamic Duo",
      runner: "Code Queens",
      poster: marPoster,
    },
    {
      name: "April 2026 Poster",
      mode: "Mode: Team Based - VibeCoding 4.0",
      winner: "Team Tech Titans",
      runner: "Cyber Techie",
      poster: aprPoster,
    },
    {
      name: "May 2026 Poster",
      mode: "Mode: Online - VibeCoding 5.0",
      winner: "Rockers",
      runner: "Unstoppable",
      poster: mayPoster,
    },
  ];
  return (
    <section
      id="past"
      className="py-20 px-6 bg-gradient-to-b from-transparent via-ink-2/30 to-transparent"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Hall of Fame"
          title="Past Hackathons"
          sub="5 editions completed · 1000+ builders across India · growing every month."
        />
        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-ink/35 p-3 shadow-[var(--shadow-elevate)] sm:block">
          <div className="marquee-past-hackathons flex w-max items-stretch gap-4">
            {[...editions, ...editions].map((e, index) => (
              <div
                key={`${e.name}-${index}`}
                className="group w-[280px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-card/70 shadow-[var(--shadow-elevate)] backdrop-blur transition hover:-translate-y-1 hover:border-saffron/40"
              >
                <div className="grid aspect-[4/5] place-items-center bg-black">
                  <img
                    src={e.poster}
                    alt={`${e.name} VibeCoding poster`}
                    loading="lazy"
                    width={832}
                    height={1056}
                    className="size-full object-contain transition-transform duration-700 group-hover:scale-[1.015]"
                  />
                </div>
                <div className="grid min-h-[190px] gap-4 p-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-saffron">
                      {e.mode}
                    </div>
                    <div className="mt-2 font-display text-lg font-semibold leading-tight">
                      {e.name}
                    </div>
                    <div className="mt-3 h-px w-16 tricolor-bar" />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="grid gap-1 rounded-lg border border-white/8 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Trophy className="size-3.5 text-saffron" />
                        Winner
                      </div>
                      <div className="font-semibold leading-tight">{e.winner}</div>
                    </div>
                    <div className="grid gap-1 rounded-lg border border-white/8 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Award className="size-3.5 text-india-green" />
                        Runner Up
                      </div>
                      <div className="font-semibold leading-tight">{e.runner}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:hidden">
          {editions.map((e) => (
            <div
              key={e.name}
              className="overflow-hidden rounded-xl border border-white/10 bg-card/70 shadow-[var(--shadow-elevate)]"
            >
              <div className="grid aspect-[4/5] place-items-center bg-black">
                <img
                  src={e.poster}
                  alt={`${e.name} VibeCoding poster`}
                  loading="lazy"
                  width={832}
                  height={1056}
                  className="size-full object-contain"
                />
              </div>
              <div className="grid gap-3 p-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-saffron">
                    {e.mode}
                  </div>
                  <div className="mt-2 font-display text-base font-semibold leading-tight">
                    {e.name}
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Trophy className="size-3.5 text-saffron" />
                      Winner
                    </div>
                    <div className="mt-1 font-semibold leading-tight">{e.winner}</div>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Award className="size-3.5 text-india-green" />
                      Runner Up
                    </div>
                    <div className="mt-1 font-semibold leading-tight">{e.runner}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    [
      "Is there a registration fee to participate?",
      "No. The July edition is completely free for all accepted participants. There is no registration fee.",
    ],
    [
      "Can I participate as an individual?",
      "Yes. You can register solo or join with a team of up to 4 — a team counts as one registration slot.",
    ],
    [
      "What is the team size limit?",
      "Up to 4 members per team. Keep the team lean and shipping-focused.",
    ],
    [
      "What is the problem statement?",
      "The official problem statement is announced by NxtGenSec (Next Generation Security) at kickoff on July 25, 10:00 AM IST. The hackathon is open-theme - pick a real problem and ship a public web product.",
    ],
    [
      "When does the hackathon start and end?",
      "Hackathon days are July 25, 26, and 27, 2026. Final project submission is due on July 27 at 11:49 PM IST.",
    ],
    [
      "What should the final submission include?",
      "A publicly deployed, usable web product + public repository + short demo. Judging prioritises usefulness, execution, clarity, and demo quality.",
    ],
    [
      "Will there be technical support during the hackathon?",
      "Yes. Approved participants are added to a dedicated WhatsApp group for kickoff, mentor support, and final evaluation.",
    ],
    [
      "What prizes will be awarded?",
      "A prize pool of ₹10,000+, participation certificates, project showcase, and opportunities for internships and collaborations.",
    ],
    [
      "Is the hackathon online or in-person?",
      "Fully online. Open to participants from anywhere in India and beyond.",
    ],
    [
      "How will the prize money be distributed?",
      "Prize distribution is announced after the evaluation period. Details are shared in the WhatsApp group and via official channels.",
    ],
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
              <AccordionContent className="text-muted-foreground pl-10">{a}</AccordionContent>
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
          Ready to build with the <span className="tricolor-text">VibeCoding</span> community?
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Registration is free. Repost the official announcement on LinkedIn, get verified, and join
          the dedicated WhatsApp group for the final evaluation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={openRegistrationDialog}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:brightness-110 transition shadow-[var(--shadow-saffron)]"
          >
            Register Now <UserPlus className="size-4" />
          </button>
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
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-india-green" /> Free registration
          </span>
          <span className="flex items-center gap-1.5">
            <Linkedin className="size-3.5 text-saffron" /> LinkedIn repost required
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-3.5 text-india-green" /> WhatsApp group after
            verification
          </span>
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
            <img
              src={nxtGenSecLogo}
              alt="NxtGenSec (Next Generation Security) logo"
              width={40}
              height={40}
              className="size-10 rounded-lg bg-black object-contain p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            />
            <div className="font-display font-bold">NxtGenSec (Next Generation Security)</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            NxtGenSec (Next Generation Security) runs focused monthly hackathons where Indian
            builders solve practical problems and ship production-ready ideas.
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
          <div>© 2026 NxtGenSec (Next Generation Security). All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-foreground">VIBECODING</span>
            <span className="opacity-40">|</span>
            <span>July 6.0 · 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
