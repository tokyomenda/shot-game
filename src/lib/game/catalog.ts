import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseCatalog } from "./csv";

// Imported only by Server Components. Client receives summaries or one category.
export async function getGameCatalog() {
  return parseCatalog(await readFile(path.join(process.cwd(), "src/data/party_game_1800_content_18plus.csv"), "utf8"));
}