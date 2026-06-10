# VibeCoding 6.0 — Single-Page Site Plan

A frontend-only, single-page site for NxtGenSec's VibeCoding 6.0 hackathon. Dark, professional, bold Indian-patriotic accents. All registration flows through a Google Form (URL to be provided by you — placeholder used until then).

## Visual Direction

- **Theme**: Dark base (near-black with subtle navy depth) for a professional, premium feel.
- **Indian flag palette (bold patriotic)**: saffron `#FF9933`, white `#FFFFFF`, India green `#138808`, navy blue `#000080` (Ashoka Chakra).
- **Motifs**: Subtle Ashoka Chakra SVG as decorative element behind hero, tricolor gradient accents on section dividers and CTAs, saffron→white→green gradient lines under headings, animated chakra spin on hover for badges.
- **Typography**: Display font with strong character (e.g., Space Grotesk / Sora) for headings; clean sans (Inter/DM Sans) for body. Big, confident hero type.
- **Effects**:
  - Card hover: lift + tricolor border glow + 3D flip-on-hover for benefits/past-hackathon cards (front = title/icon, back = details).
  - Subtle grain/noise overlay for depth.
  - Smooth scroll between sections; sticky translucent nav with tricolor underline on active link.
  - Countdown timer to June 27, 10:00 AM IST with pulsing accents.
  - Marquee strip of past winners.

## Single-Page Sections (in order)

1. **Sticky Nav** — logo + anchor links (Home, About, Problem, Timeline, Process, Benefits, Past, FAQ) + Register CTA (opens Google Form in new tab).
2. **Hero** — headline, subhead, kickoff countdown, two CTAs (Register / Explore), quick facts strip (Solo/Team up to 4 · Free · Prize ₹10,000+ · Online).
3. **About VibeCoding 6.0** — intro paragraph + 4 feature cards (Open Innovation, Online & Accessible, Solo or Team, 2-Day Sprint).
4. **Problem Statement** — "Announced by NxtGenSec at kickoff" callout card with locked/reveal styling; open-innovation brief; judging criteria; note that PS drops at kickoff.
5. **Timeline** — vertical tricolor timeline with 7 milestones (Jun 1 → Jul 1).
6. **Registration Process** — 5 numbered steps. Step 2 clearly states LinkedIn repost is mandatory. Step 3 mentions WhatsApp group addition post-verification for final evaluation.
7. **Benefits** — grid of 10 cards with flip-on-hover (front: icon + title, back: detail). Prize highlight card is larger/featured with tricolor gradient.
8. **Past Hackathons (Hall of Fame)** — 5 stylized poster placeholders (Jan–May 2026) generated as on-theme images + winner/runner-up cards per edition.
9. **FAQs** — 10-item accordion. First answer pre-expanded.
10. **Final Register CTA band** — bold tricolor gradient band, reiterates: free, LinkedIn repost required, WhatsApp group after verification.
11. **Footer** — logo, quick links (anchors), contact emails/sites, copyright.

**Removed**: live "Registered Teams" dashboard (per your decision — not needed).

## Key Content Rules

- All Register buttons → open the Google Form URL in a new tab. Until you share the URL, a single constant `GOOGLE_FORM_URL` placeholder is used in one place so swapping later is one-line.
- Mandatory notes called out clearly:
  - **Free registration** — no fee.
  - **LinkedIn repost required** before approval.
  - **WhatsApp group** added after verification for final evaluation.
  - **Problem Statement** revealed by NxtGenSec at kickoff.

## Technical Section (for reference)

- TanStack Start, single route `src/routes/index.tsx` containing all sections as components in `src/components/sections/`.
- Design tokens added to `src/styles.css` (`@theme` block): `--color-saffron`, `--color-india-green`, `--color-chakra-blue`, `--color-ink` (dark bg), `--color-ink-2`, gradient tokens (`--gradient-tricolor`), shadow tokens (`--shadow-saffron-glow`).
- `.dark` set on `<html>` by default.
- Components: `Nav`, `Hero` (with `Countdown` subcomponent), `About`, `ProblemStatement`, `Timeline`, `Process`, `Benefits` (with `FlipCard`), `PastHackathons`, `Faqs` (shadcn Accordion), `CtaBand`, `Footer`, `AshokaChakra` (SVG), `TricolorDivider`.
- Update `__root.tsx` head: title "VibeCoding 6.0 — NxtGenSec Monthly Hackathon", meta description, og tags. Single H1 in Hero.
- 5 poster placeholders generated via `imagegen` (fast tier, 1024×1280, dark on-theme stylized posters labeled Jan–May 2026, VibeCoding 1.0–5.0), saved under `src/assets/posters/` and imported.
- Countdown uses `useEffect` + `setInterval`; target `2026-06-27T10:00:00+05:30`.
- Smooth scroll via `scroll-behavior: smooth` and `<a href="#section">` anchor links (acceptable here since this is genuinely a single long scrolling page per your request).
- Accordion, Card, Button from existing shadcn components; no new deps needed.

## Deliverable Checklist

- Single page, dark theme, bold tricolor accents, chakra motif.
- All CTAs wired to Google Form placeholder.
- 5 generated past-hackathon posters.
- LinkedIn repost + WhatsApp post-verification messaging clearly visible.
- Problem Statement section communicates "revealed at kickoff by NxtGenSec".
- No registered-teams live data section.
- Responsive (mobile, tablet, desktop), hover effects, flip cards, countdown.

## Open Item

- **Google Form URL** — share it whenever ready; I'll wire it in. Until then I'll use a clearly-marked placeholder constant.
