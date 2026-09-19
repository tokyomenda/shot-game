export type SourceCard = {
  id: number; sourceId: string; type: "question" | "challenge"; text: string;
  sourceType: "question" | "challenge" | "choice" | "vote";
  difficulty: string; players: string; action: string;
};
export type Category = {
  id: string; name: string; count: number; difficulties: string[]; types: string[];
  minPlayers: number; maxPlayers: number; adult: boolean; cards: SourceCard[];
};
export type CategorySummary = Omit<Category, "cards">;

// RFC-style quoted fields, escaped quotes, embedded newlines, UTF-8 BOM and CRLF.
export function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const input = source.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') { if (input[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
      else field += char;
    } else if (char === "," || char === "\n" || char === "\r") {
      row.push(field); field = ""; closed = false;
      if (char !== ",") { if (row.some(value => value !== "")) rows.push(row); row = []; if (char === "\r" && input[i + 1] === "\n") i++; }
    } else if (char === '"' && field === "" && !closed) quoted = true;
    else { if (closed || char === '"') throw new Error("Malformed CSV quote"); field += char; }
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  row.push(field); if (row.some(value => value !== "")) rows.push(row);
  return rows;
}

export function parseCatalog(source: string): Category[] {
  const [header, ...rows] = parseCsv(source);
  const expected = ["id","category_id","category","question_id","question","type","difficulty","age","players","action"];
  if (!header || header.join(",") !== expected.join(",")) throw new Error("Unexpected game CSV columns");
  const categories = new Map<string, Category>(), ids = new Set<string>();
  const actions: Record<string,string> = { question: "answer", challenge: "do", choice: "choose", vote: "vote" };
  for (const [index, values] of rows.entries()) {
    if (values.length !== header.length || values.some(value => !value.trim())) throw new Error("Invalid CSV row " + (index + 2));
    const [id, categoryId, name, questionId, text, type, difficulty, age, players, action] = values;
    const limits = /^(\d+)-(\d+)$/.exec(players);
    if (ids.has(id) || !/^[1-9]\d*$/.test(categoryId) || !/^[1-9]\d*$/.test(questionId) || !limits || actions[type] !== action || !/^\d+\+$/.test(age)) throw new Error("Invalid CSV data at row " + (index + 2));
    ids.add(id);
    const min = Number(limits[1]), max = Number(limits[2]);
    if (min < 2 || max < min || max > 10) throw new Error("Unsupported player range: " + players);
    let category = categories.get(categoryId);
    if (!category) {
      category = { id: categoryId, name, count: 0, difficulties: [], types: [], minPlayers: min, maxPlayers: max, adult: false, cards: [] };
      categories.set(categoryId, category);
    }
    if (category.name !== name || category.cards.some(card => card.id === Number(questionId))) throw new Error("Inconsistent category or duplicate question ID");
    category.minPlayers = Math.max(category.minPlayers, min);
    category.maxPlayers = Math.min(category.maxPlayers, max);
    if (category.minPlayers > category.maxPlayers) throw new Error("Incompatible player ranges");
    category.adult ||= Number(age.slice(0,-1)) >= 18;
    if (!category.difficulties.includes(difficulty)) category.difficulties.push(difficulty);
    if (!category.types.includes(type)) category.types.push(type);
    category.cards.push({ id: Number(questionId), sourceId: id, type: type === "challenge" ? "challenge" : "question", sourceType: type as SourceCard["sourceType"], text, difficulty, players, action });
    category.count++;
  }
  if (!categories.size) throw new Error("Game CSV is empty");
  return [...categories.values()].sort((a,b) => Number(a.id) - Number(b.id));
}

export function shuffleCards<T>(cards: readonly T[], random = Math.random): T[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}