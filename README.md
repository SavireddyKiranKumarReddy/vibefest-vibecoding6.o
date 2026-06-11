# VibeCoding Hackathon 6.0

VibeCoding Hackathon 6.0 is the official July 2026 event website for NxtGenSec (Next Generation Security). The site presents the hackathon, timeline, benefits, collaborators, past editions, FAQs, public registration workflow, and a protected admin dashboard for managing registrations.

The project is built as a polished event experience with a dark premium interface, Indian tricolor accents, Ashoka Chakra visual detail, NxtGenSec (Next Generation Security) branding, mobile-first navigation, Supabase-backed registration, and manual admin approval.

## Main Features

- Responsive landing page for VibeCoding Hackathon 6.0.
- Desktop navigation and premium mobile bottom navigation.
- Hero section with countdown to July 25, 2026.
- July 2026 timeline with registration, hackathon, evaluation, and results dates.
- Popup registration dialog with dynamic participant type and team-size logic.
- Registration support for student and professional participants.
- Team size support for solo, duo, trio, and squad registrations.
- Automatic duplicate protection for team names and participant emails.
- Manual verification message explaining WhatsApp group access after approval.
- Collaborators carousel with demo data ready to replace.
- Past Hackathons showcase with poster carousel and dynamic winner/runner-up panel.
- Protected `/admin` dashboard using Supabase Auth.
- Admin filters for all, student, professional, solo, duo, trio, squad, and status views.
- Admin actions to approve, disapprove, edit, and delete registrations.
- Supabase SQL schema with RLS policies, admin whitelist, RPC functions, and uniqueness rules.

## Tech Stack

- React 19
- TanStack Router / TanStack Start
- Vite
- TypeScript
- Tailwind CSS 4
- shadcn/Radix UI primitives
- Lucide React icons
- Supabase JavaScript SDK
- Supabase Auth, Postgres, RLS, and RPC functions
- Bun for package management and scripts

## Project Structure

```text
.
├── .env.example
├── README.md
├── package.json
├── bun.lock
├── supabase
│   └── schema.sql
├── src
│   ├── assets
│   │   ├── nxtgensec-logo.png
│   │   └── posters
│   ├── components
│   │   ├── AshokaChakra.tsx
│   │   ├── RegistrationSection.tsx
│   │   └── ui
│   ├── lib
│   │   ├── registration.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── routes
│   │   ├── __root.tsx
│   │   ├── admin.tsx
│   │   └── index.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── start.ts
│   └── styles.css
├── vercel.json
├── vite.config.ts
└── tsconfig.json
```

## Important Files

- `src/routes/index.tsx`: Main event page, navigation, hero, timeline, process, collaborators, past hackathons, FAQ, footer, and CTA sections.
- `src/components/RegistrationSection.tsx`: Public registration dialog. Handles student/professional mode, solo/duo/trio/squad teams, client validation, Supabase RPC submission, and duplicate-friendly error messages.
- `src/routes/admin.tsx`: Protected admin dashboard at `/admin`. Handles Supabase email/password login, filters, metrics, approval/disapproval, editing, and deletion.
- `src/lib/supabase.ts`: Supabase browser client initialized from Vite environment variables.
- `src/lib/registration.ts`: Shared registration constants, types, team-size logic, and status helpers.
- `supabase/schema.sql`: Complete database schema, constraints, RLS policies, admin whitelist table, and RPC functions.
- `.env.example`: Required environment variable template.
- `src/styles.css`: Global theme, tricolor utilities, animation utilities, dark interface tokens, flip cards, and marquees.

## Event Schedule

- June 1, 2026: Registrations open.
- July 25, 2026: Hackathon Day 1.
- July 26, 2026: Hackathon Day 2.
- July 27, 2026: Hackathon Day 3.
- July 27, 2026 at 11:49 PM IST: Final project submission.
- July 28-29, 2026: Evaluation and top performer selection.
- July 31, 2026: Final result announcement.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the full SQL in `supabase/schema.sql`.
4. Create an admin user in Supabase Authentication using email and password.
5. Add that same admin email to the `admin_users` table:

```sql
insert into public.admin_users (email)
values ('your-admin-email@example.com');
```

6. Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

7. Restart the local dev server after changing environment variables.

## Registration Rules

- Every team must have a unique team name.
- Every participant email must be globally unique across all teams.
- Team lead details include name, email, phone, LinkedIn profile, LinkedIn repost URL, affiliation, and optional note.
- Additional participants provide name, email, LinkedIn profile, and LinkedIn repost URL.
- Registration status starts as `pending`.
- Admins manually approve or disapprove teams after verification.
- Approved participants are told they will be added to the WhatsApp group after verification.

## Admin Dashboard

Visit:

```text
/admin
```

The admin dashboard supports:

- Email/password login through Supabase Auth.
- All registrations view.
- Student/professional filters.
- Solo/duo/trio/squad filters.
- Pending/approved/disapproved filters.
- Search by team, lead, or email.
- Quick approve and disapprove actions.
- Full registration editing.
- Registration deletion.

Only users in the `admin_users` table can read or manage registration data.

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

The project is ready for Vercel deployment through the existing `vercel.json` and Vite/TanStack Start build setup. Add the same Supabase environment variables in the deployment platform before publishing.

## Maintenance Notes

- Update timeline content in `src/routes/index.tsx`.
- Update registration behavior in `src/components/RegistrationSection.tsx`.
- Update admin workflow in `src/routes/admin.tsx`.
- Update registration types and team-size/status options in `src/lib/registration.ts`.
- Update database tables, policies, or RPC functions in `supabase/schema.sql`.
- Replace collaborator demo data in the `Collaborators` section of `src/routes/index.tsx`.
- Replace past hackathon poster assets inside `src/assets/posters` and update the `PastHackathonsShowcase` data.
