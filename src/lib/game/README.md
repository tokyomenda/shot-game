# CSV game catalog

Source of truth: src/data/party_game_1800_content_18plus.csv. Do not edit question/category text in components. Keep the header and unique id/category_id/question_id values. The parser validates quoted fields, types/actions, player ranges and category consistency; malformed content fails the build.

catalog.ts reads UTF-8 CSV only in Server Components. /play receives category summaries, /play/[categoryId] receives only that category's cards. generateStaticParams prerenders every CSV category. Rebuild production after CSV edits; no generated content copy or new package is required. Numeric category_id is the stable URL ID.

PartyGame accepts an optional category, retaining its legacy fallback. Category sessions shuffle a copy once, advance without replacement, and finish when exhausted. Replay starts a new session. Existing PlayingCard animation, player setup, penalty overlay and punishment deck are reused. cards.ts and punishments.ts remain for the legacy fallback and the existing optional penalty action; primary question/challenge/choice/vote content comes only from CSV. PASS advances without a penalty.

Type determines the card heading; action determines the completion label; difficulty and players appear as metadata. players constrains setup. All current rows have age=18+, so all categories require sessionStorage confirmation. This is a UI age confirmation, not identity verification. Storage-blocked browsers still work but may prompt again on another route.

Checks: node --test tests/game-csv.test.mjs; npm run build. Browser flow test: start production on port 3100 then node tests/game-browser.mjs (Chrome installed locally required).