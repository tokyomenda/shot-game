"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PartyGame from "@/components/PartyGame";
import type { Category } from "@/lib/game/csv";
import styles from "./Game.module.css";

const ageKey = "haluun-age-confirmed";
export default function CategoryGame({ category }: { category: Category }) {
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(!category.adult);
  useEffect(() => {
    try { setConfirmed(!category.adult || sessionStorage.getItem(ageKey) === "yes"); } catch { setConfirmed(!category.adult); }
    setReady(true);
  }, [category.adult]);
  function confirm() { try { sessionStorage.setItem(ageKey, "yes"); } catch { /* Storage blocked: confirmation still works for this page. */ } setConfirmed(true); }
  if (!ready) return <main className={styles.gate} role="status">Хөзрөө бэлдэж байна…</main>;
  if (!confirmed) return <main className={styles.gate}><Link href="/play" className={styles.back}>← Ангиллууд</Link><span className={styles.ageSeal}>18+</span><div className={styles.eyebrow}>ЭХЛЭХЭЭС ӨМНӨ</div><h1>Насанд хүрсэн үү?</h1><h2>{category.name}</h2><p>Энэ ангилал 18-аас дээш насныханд зориулагдсан.<br />Та болон хамт тоглох хүмүүс 18 нас хүрсэн байх ёстой.</p><button className="button primary" onClick={confirm}>БИД БҮГД 18 НАС ХҮРСЭН</button><Link className={styles.back} href="/play">Буцах</Link></main>;
  return <div className={styles.categoryGame}><nav className={styles.gameNav}><Link href="/play">← Ангиллууд</Link><Link href="/">Нүүр ↗</Link></nav><PartyGame key={category.id} category={category} /></div>;
}