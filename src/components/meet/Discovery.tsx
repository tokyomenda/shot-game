"use client";

import { useRef, useState } from "react";
import type { DiscoveryDecision, DiscoveryProfile } from "./types";
import ProfileCard from "./ProfileCard";
import ProfileActions from "./ProfileActions";
import LevelProgress from "./LevelProgress";
import QuestionCard from "./QuestionCard";
import ContactUnlock from "./ContactUnlock";
import styles from "../social/Social.module.css";

export default function Discovery({ profiles, mode = "demo", onDecision, onRefresh }: { profiles: readonly DiscoveryProfile[]; mode?: "demo" | "live"; onDecision?: (id: string, decision: DiscoveryDecision) => Promise<void>; onRefresh?: () => void }) {
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const profile = profiles[index];

  async function decide(decision: DiscoveryDecision) {
    if (!profile || locked.current) return;
    locked.current = true; setBusy(true);
    try {
      await onDecision?.(profile.id, decision);
      setNotice(decision === "interested" ? mode === "live" ? `${profile.name}-г сонирхсон сонголт хадгалагдлаа. Match хэсэг дараа нээгдэнэ.` : `${profile.name}-г сонирхсон сонголтыг туршлаа. Demo тул хадгалагдахгүй.` : `${profile.name}-г алгаслаа.`);
      setIndex(current => current + 1);
    } catch { setNotice("Сонголтыг хадгалж чадсангүй. Холболтоо шалгаад дахин оролдоно уу."); }
    finally { locked.current = false; setBusy(false); }
  }

  return <main className={styles.discovery}>
    <div className={styles.discoveryHeading}><div><div className={styles.kicker}>ШИНЭ ХҮН. ШИНЭ ТҮҮХ.</div><h1>ТАНИЛЦАХ <span>УУ?</span></h1></div><span className={styles.previewTag}>{mode === "demo" ? "ТУРШИЛТЫН ЗАГВАР" : "ШИНЭ ТАНИЛУУД"}</span></div>
    <div className={styles.discoveryGrid}>
      <section className={styles.profileColumn} aria-label="Хүмүүстэй танилцах">
        <div className={styles.profileCounter}><span>НЭГ ТАНИЛААС БҮХЭН ЭХЭЛНЭ</span><span>{String(Math.min(index + 1, profiles.length)).padStart(2, "0")} / {String(profiles.length).padStart(2, "0")}</span></div>
        {profile ? <><ProfileCard key={profile.id} profile={profile} demo={mode === "demo"} /><ProfileActions onDecide={decide} disabled={busy} /></> : <div className={styles.empty}><span>✦</span><h2>Одоогоор өөр<br />профайл алга.</h2><p>{mode === "demo" ? "Энэ бол танилцах хэсгийн загвар." : "Дараа дахин шалгаарай. Шинэ танилууд нэмэгдэнэ."}</p><button onClick={() => { if (onRefresh) onRefresh(); else { setIndex(0); setNotice(""); } }}>Дахин үзэх ↻</button></div>}
        <p className={styles.notice} role="status">{notice || (mode === "demo" ? "Зохиомол нэр, жишээ зурагтай demo профайлууд." : "Алгасах сонголт энэ үзэлтийн хугацаанд үйлчилнэ.")}</p>
      </section>
      <aside className={styles.journey}>
        <div className={styles.kicker}>ТАНИЛЦАХ ӨӨР НЭГ АРГА</div><h2>Зүгээр нэг мэндээс<br /><em>илүүг мэдэр.</em></h2>
        <p className={styles.journeyIntro}>Нэг нэгнээ асуулт бүрээр нээ.<br />Жинхэнэ танил удаан, сонирхолтой эхэлдэг.</p>
        <ol className={styles.steps}><li><span>01</span><div><h3>Харилцан сонирхол</h3><p>Хоёулаа сонирхсон үед match үүснэ.</p></div></li><li><span>02</span><div><h3>Нэг асуулт. Хоёр хариулт.</h3><p>Систем асуулт тавина. Тус тусдаа хариулаад, хоёулаа хариулсны дараа л хариултуудаа харна.</p></div></li><li><span>03</span><div><h3>Түвшин бүрээр илүү ойр</h3><p>Хариултаа харсны дараа дараагийн түвшин нээгдэнэ. Шууд мессеж бичих боломжгүй.</p></div></li></ol>
        <LevelProgress /><QuestionCard /><ContactUnlock /><p className={styles.futureNote}>Ирээдүйн танилцах урсгалын танилцуулга. Одоогоор идэвхжээгүй.</p>
      </aside>
    </div>
  </main>;
}