# VibeCoding 6.0

VibeCoding Hackathon 6.0 is a responsive event website for the July 2026 NxtGenSec (Next Generation Security) monthly online hackathon. It presents the hackathon story, registration flow, timeline, benefits, previous edition highlights, FAQs, and final call to action in a single polished landing experience.

The project is built with React, TanStack Router/Start, Vite, Tailwind CSS, shadcn-style UI primitives, and Lucide icons. It is designed as a dark, premium event page with Indian tricolor accents, Ashoka Chakra motion details, NxtGenSec (Next Generation Security) branding, and mobile-first navigation.

## What The Website Contains

- Fixed desktop navigation with NxtGenSec (Next Generation Security) branding, anchor links, and a registration button.
- Premium mobile bottom navigation for Home, Timeline, Register, Benefits, and FAQs.
- Hero section with centered Ashoka Chakra background, countdown timer, hackathon value proposition, and registration actions.
- About section explaining the event format and participation model.
- Problem statement section describing the kickoff reveal and judging priorities.
- Timeline section listing all important July 2026 milestones.
- Registration process section explaining form submission, LinkedIn repost, approval, WhatsApp group access, build window, and evaluation.
- Benefits section with prize pool highlight and flip cards for certificates, mentors, resources, opportunities, showcase, and networking.
- Collaborators section with replaceable demo logo/name data displayed in a flowing carousel.
- Past Hackathons section with a left-side poster carousel and a dynamic right-side detail panel that updates winner and runner-up information.
- FAQ accordion for common participant questions.
- Final CTA and footer with quick links and contact details.

## Tech Stack

- React 19 for the UI.
- TanStack Router and TanStack Start for routing and app structure.
- Vite for development and production builds.
- Tailwind CSS 4 for styling.
- Radix UI primitives through local `src/components/ui` components.
- Lucide React for icons.
- TypeScript for type-safe app code.

## Project Structure

```text
.
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── src
│   ├── assets
│   │   ├── nxtgensec-logo.png
│   │   └── posters
│   │       ├── january-2026.jpg
│   │       ├── february-2026.jpg
│   │       ├── march-2026.jpg
│   │       ├── april-2026.jpeg
│   │       └── may-2026.jpeg
│   ├── components
│   │   ├── AshokaChakra.tsx
│   │   └── ui
│   ├── hooks
│   ├── lib
│   ├── routes
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
└── components.json
```

## Important Files

- `src/routes/index.tsx`: Main page content and layout. Most event sections, navigation links, countdown logic, poster data, and CTA URLs live here.
- `src/styles.css`: Global theme tokens, Tailwind imports, dark event styling, tricolor utilities, animations, flip-card behavior, and marquee animation.
- `src/components/AshokaChakra.tsx`: Reusable SVG Ashoka Chakra component used as decorative event branding.
- `src/assets/nxtgensec-logo.png`: NxtGenSec (Next Generation Security) logo used in the navbar and footer.
- `src/assets/posters`: Past hackathon poster images used in the Hall of Fame section.
- `src/components/ui`: Reusable UI primitives such as accordion, button, card, dialog, input, tooltip, and other shadcn/Radix-based components.
- `vercel.json`: Deployment configuration for Vercel.

## Main Configuration Values

In `src/routes/index.tsx`:

- `GOOGLE_FORM_URL`: Registration form URL. Replace the placeholder with the real Google Form link before launch.
- `LINKEDIN_POST_URL`: Official LinkedIn/company URL used by the CTA.
- `NAV`: Desktop navigation anchors.
- `MOBILE_NAV`: Mobile bottom navigation labels, icons, and destinations.
- `PastHackathons.editions`: Poster, winner, runner-up, and mode data for previous hackathons.
- `useCountdown(new Date("2026-07-25T10:00:00+05:30"))`: Hackathon kickoff countdown target.

## July 2026 Event Schedule

- June 1, 2026: Registrations open.
- July 25, 2026: Hackathon Day 1.
- July 26, 2026: Hackathon Day 2.
- July 27, 2026: Hackathon Day 3 and final project submission.
- July 27, 2026 at 11:49 PM IST: Final submission deadline.
- July 28-29, 2026: Evaluation and top performer selection.
- July 31, 2026: Final result announcement.

## Local Development

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

Run linting:

```bash
bun run lint
```

## Deployment

The project includes `vercel.json` and can be deployed to Vercel. Build output is produced through the configured Vite/TanStack Start setup. Before deployment, update the registration form URL and verify all official links.

## Content Update Guide

To change event dates, edit the timeline array and countdown target in `src/routes/index.tsx`.

To change registration behavior, update `GOOGLE_FORM_URL`.

To update previous hackathon posters, place new images in `src/assets/posters` and update the `editions` array in `PastHackathonsShowcase`.

To update brand assets, replace `src/assets/nxtgensec-logo.png` with the latest logo and keep the same filename, or update the import in `src/routes/index.tsx`.

To adjust colors, shadows, gradients, and animation utilities, edit `src/styles.css`.

## Notes For Future Maintainers

The page is intentionally implemented as a single route because the website is a focused event landing page. This keeps the content easy to audit before launch and makes anchor navigation predictable across desktop and mobile. Shared primitives remain in `src/components/ui`, while event-specific sections stay in `src/routes/index.tsx`.

The project currently uses a placeholder Google Form URL. Replace it before public release.
