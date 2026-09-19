# Meet foundation

MeetExperience manages browser authentication and resets member state on user changes. AuthScreen supports email/password signup/login and confirmation-required feedback. ProfileSetup validates inputs and uploads to a private bucket, then saves profile and contact data through one RLS-enforced transaction.

src/lib/supabase/browser.ts is the reusable publishable-key client. src/lib/meet/repository.ts owns data access; validation.ts owns browser validation (database constraints independently enforce validation).

Discovery retains its demo mode (default) and existing visual components. /meet supplies real rows, uses live mode and persists interest. Mock profiles remain in src/data/profiles.ts for visual development and are never substituted for a database failure or empty results.

Manual schema, dashboard settings and security verification steps: supabase/README.md. No matches, chat, answer reveal or contact unlock is implemented. QuestionCard, LevelProgress and ContactUnlock remain future-flow previews.