# Discovery prototype

Discovery owns temporary browser state only. ProfileCard and ProfileActions receive typed props; data is supplied by the /meet server page. Replace demoProfiles with a server-side public-profile query when connecting Supabase. No authentication, persistence, matching, chat or contact exchange is implemented.

Future server-enforced flow:
1. Create a match only after both participants express interest.
2. Assign a system question for level 1. Keep answers private until both submit.
3. Reveal both answers together, then unlock the next question, through level 10.
4. After both complete level 10, collect separate contact-exchange consent from each participant.
5. Release contact information only when both have consented.

Use separate private answer and contact records with participant-scoped RLS and server-side authorization. Never send unrevealed answers or locked contact fields to the client. DiscoveryProfile intentionally contains no contact fields. Do not add direct messaging. LevelProgress, QuestionCard and ContactUnlock currently illustrate the future flow; they are not authorization controls.
