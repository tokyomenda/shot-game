import test from "node:test";
import assert from "node:assert/strict";
import { ageOnDate, validatePhoto, validateProfile } from "../src/lib/meet/validation.ts";
test("age uses exact birthday and rejects invalid calendar dates", () => {
  const today = new Date("2026-09-19T12:00:00Z");
  assert.equal(ageOnDate("2008-09-19", today), 18);
  assert.equal(ageOnDate("2008-09-20", today), 17);
  assert.equal(ageOnDate("2008-09-18", today), 18);
  assert.ok(Number.isNaN(ageOnDate("2008-02-30", today)));
  assert.ok(Number.isNaN(ageOnDate("not-a-date", today)));
  assert.equal(ageOnDate("2008-02-29", new Date("2026-02-28T00:00:00Z")), 17);
});
test("profile rejects minors, bad enums and oversized interests", () => {
  const adult = { display_name: "Test", birth_date: "1995-01-01", gender: "woman", interested_in: "everyone", city: "UB", bio: "Hello", interests: ["Coffee"], contact_information: "" };
  assert.equal(validateProfile(adult), null);
  assert.ok(validateProfile({ ...adult, birth_date: new Date().toISOString().slice(0,10) }));
  assert.ok(validateProfile({ ...adult, gender: "invalid" }));
  assert.ok(validateProfile({ ...adult, interests: ["x".repeat(31)] }));
  assert.ok(validateProfile({ ...adult, interests: [] }));
  assert.ok(validateProfile({ ...adult, contact_information: "x".repeat(1001) }));
});
test("photos restrict type and size", () => {
  assert.equal(validatePhoto({ type: "image/jpeg", size: 5 * 1024 * 1024 }), null);
  assert.ok(validatePhoto({ type: "image/svg+xml", size: 100 }));
  assert.ok(validatePhoto({ type: "image/png", size: 0 }));
  assert.ok(validatePhoto({ type: "image/webp", size: 5 * 1024 * 1024 + 1 }));
});