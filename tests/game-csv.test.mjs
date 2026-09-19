import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseCsv, parseCatalog, shuffleCards } from "../src/lib/game/csv.ts";
const source = readFileSync(new URL("../src/data/party_game_1800_content_18plus.csv", import.meta.url), "utf8");
test("CSV quoted commas, newlines, escaped quotes, BOM and CRLF", () => {
  assert.deepEqual(parseCsv('\ufeffa,b\r\n"x,y","say ""hi""\nnext"\r\n'), [["a","b"],["x,y",'say "hi"\nnext']]);
  assert.throws(() => parseCsv('a\n"unclosed'));
});
test("all source categories and text survive without substitution", () => {
  const catalog = parseCatalog(source), rows = parseCsv(source).slice(1);
  assert.equal(catalog.length, 60);
  assert.equal(rows.length, 1800);
  assert.equal(catalog.reduce((total,c) => total + c.count,0), rows.length);
  for (const row of rows) {
    const category = catalog.find(c => c.id === row[1]);
    assert.equal(category.name,row[2]);
    const card = category.cards.find(c => c.sourceId === row[0]);
    assert.equal(card.text,row[4]);
    assert.equal(card.sourceType,row[5]);
    assert.equal(card.difficulty,row[6]);
    assert.equal(card.players,row[8]);
    assert.equal(card.action,row[9]);
  }
  for (const c of catalog) { assert.equal(c.count,30); assert.equal(c.adult,true); assert.equal(c.minPlayers,2); assert.equal(c.maxPlayers,10); }
});
test("shuffle is finite, category-local, unique, and leaves source untouched", () => {
  for (const category of parseCatalog(source)) {
    const original = category.cards.map(c=>c.sourceId);
    const shuffled = shuffleCards(category.cards, () => 0.25);
    assert.deepEqual(category.cards.map(c=>c.sourceId),original);
    assert.equal(new Set(shuffled.map(c=>c.sourceId)).size,category.count);
    assert.deepEqual(shuffled.map(c=>c.sourceId).sort(),[...original].sort());
  }
});
test("invalid source fails loudly rather than silently discarding rows", () => {
  const lines = source.trim().split(/\r?\n/);
  assert.throws(() => parseCatalog(lines[0]+"\n"+lines[1]+"\n"+lines[1]));
  assert.throws(() => parseCatalog(source.replace(",challenge,",",unknown,")));
  assert.throws(() => parseCatalog(source.replace(",2-10,",",10-2,")));
});