"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CategorySummary } from "@/lib/game/csv";
import styles from "./Game.module.css";

const icons: Record<string,string> = { challenge: "↯", question: "?", choice: "◇", vote: "♛" };
export default function CategoryBrowser({ categories }: { categories: CategorySummary[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => categories.filter(category => category.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [categories, query]);
  return <main className={styles.catalog}>
    <section className={styles.hero}><div><div className={styles.eyebrow}>НАЙЗУУД. НЭГ ҮДЭШ. ОЛОН СОНГОЛТ.</div><h1>ТОГЛООМОО<br /><em>СОНГО<span>✦</span></em></h1><p>Найзуудаа цуглуул. Өнөө оройн хөзрөө сонго.</p><div className={styles.totals}><b>{categories.length}</b> ангилал <i /> <b>{categories.reduce((total, category) => total + category.count, 0)}</b> хөзөр <i /> 18+</div></div><div className={styles.art} aria-hidden="true"><span /><span /><span><small>ХАЛУУН ХӨЗӨР</small>✦<small>ҮДШИЙН НУУЦ</small></span></div></section>
    <div className={styles.searchBar}><label htmlFor="category-search">ӨНӨӨДРИЙН СОНГОЛТ</label><div><span aria-hidden="true">⌕</span><input id="category-search" type="search" placeholder="Ангилал хайх…" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" />{query && <button onClick={() => setQuery("")} aria-label="Хайлт цэвэрлэх">×</button>}</div></div>
    <p className={styles.count} role="status">{filtered.length} ангилал</p>
    <div className={styles.grid}>{filtered.map(category => <Link href={`/play/${category.id}`} className={styles.category} key={category.id}><div className={styles.cardTop}><span className={styles.icon} aria-hidden="true">{icons[category.types[0]] ?? "✦"}</span><span>{category.adult && "18+"}<small> / {category.id.padStart(2,"0")}</small></span></div><h2>{category.name}</h2><p>{category.count} хөзөр <span>·</span> {category.minPlayers}–{category.maxPlayers} тоглогч</p><div className={styles.difficulty} aria-label={"Түвшин: " + category.difficulties.join(", ")}><span aria-hidden="true">▂▃▅▆█</span>{category.difficulties.join(" · ")}</div><div className={styles.cardBottom}><span>ТОГЛОХ</span><span aria-hidden="true">↗</span></div></Link>)}</div>
    {!filtered.length && <div className={styles.empty}><span>◇</span><h2>Ангилал олдсонгүй.</h2><p>Өөр нэрээр хайгаад үзээрэй.</p><button onClick={() => setQuery("")}>Бүх ангиллыг харах</button></div>}
  </main>;
}