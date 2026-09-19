# Manual Supabase setup

The application never executes schema.sql. Run the entire schema.sql ONCE in Supabase Dashboard > SQL Editor as the project postgres role. It creates seven tables (including the separately protected profile_contacts), functions, indexes, RLS and a private profile-photos bucket. This is an initial migration: existing tables/bucket with these names cause rollback, not destructive replacement. Review any pre-existing Storage policies: permissive unrelated policies must not expose this bucket.

## Dashboard
- Authentication > Providers / Sign In: enable Email and email/password signup. Keep Confirm email enabled. Set minimum password length to at least 8.
- Authentication > URL Configuration: Site URL http://localhost:3000; add http://localhost:3000/meet to Redirect URLs. For deployment add the exact production origin and /meet URL.
- Configure SMTP for delivery to real users. Supabase's default email service restricts recipients/rate; use allowed test addresses until SMTP is configured.
- Storage: verify profile-photos is PRIVATE, 5 MB limit, JPEG/PNG/WebP only. SQL creates the bucket and policies; do not make it public.
- Keep the existing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the project ROOT .env.local. Next.js does not use src/app/.env.local. Do not commit either file. Restart dev after environment changes. No service credential is needed.

## Local verification
1. npm run dev; open http://localhost:3000/meet. Register A, follow email confirmation, then sign in if needed.
2. A must see profile setup before discovery. Try an under-18 date, then a valid adult profile with a JPG/PNG/WebP under 5 MB. Enter private contact text. Save, reload, edit and sign out.
3. Use another browser/incognito to register and finish B. Refresh discovery: A sees B, B sees A, neither sees themselves. No real users means an empty state, never substituted fake profiles.
4. Interest persists in likes; skip only advances this browser list. Repeated likes are harmless. Match creation, levels and contact exchange are deliberately not active.
5. Check expired/invalid password, unconfirmed email, offline save/retry and sign-out. Signed image links last one hour; refresh the list to renew them.
6. Check / and /play: setup 2+ players, flip card, complete/penalty, results and home link remain unchanged.

## Privacy checks using authenticated API sessions (not SQL Editor's admin role)
With A's JWT and the publishable key:
- GET profiles filtered by B id: zero rows. GET profile_contacts filtered by B user_id: zero rows.
- discover_profiles RPC: only id, display_name, age, city, bio, interests, photo_path. No birth date, contacts or email.
- PATCH B profile/contact or INSERT a row owned by B: denied or zero affected rows.
- Upload/overwrite/delete B's storage path: denied. Anonymous photo reads: denied.
- INSERT/UPDATE matches, match_answers, questions or contact_exchange_requests: permission denied. Changing current_level cannot unlock contacts.
- Anonymous table access and discovery RPC: denied.
Repeat swapping A and B. Tests require the manually deployed schema and real test sessions; build success does not verify deployed RLS.

## Architecture / next phase
profiles contains owner-private birthday/preferences and display fields; its raw rows are owner-only. discover_profiles is a fixed-column SECURITY DEFINER projection with explicit auth/profile checks and a locked search_path. profile_contacts has independent owner-only RLS and is never joined into discovery. Photo writes require the caller's UUID folder; read policy exposes only registered profile photos to completed members, plus the owner's own uploads.

save_meet_profile is SECURITY INVOKER: profile and contact updates share one database transaction under caller RLS. Photo upload is separate. Ambiguous save failures keep the upload because the transaction may have committed; a future maintenance job may clean unreferenced uploads. Profile fields are plain text and React escapes rendering; users should not put contacts in public biography or photos.

The future server workflow must atomically verify reciprocal likes, assign a shared question per level, accept each participant's answer once, reveal only after both submit, and advance through 10 levels. Only then may each participant record consent. A separate authorized contact-read operation must verify level 10 completion and BOTH consents for this match. Do not loosen owner-only contact RLS or use client flags. The reserved tables have no client write privileges until that workflow exists. No direct messaging table/API exists.

References: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/storage/security/access-control