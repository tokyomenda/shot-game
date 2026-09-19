import styles from "../social/Social.module.css";

export default function LevelProgress() {
  return <div className={styles.levelProgress} aria-label="Танилцах зам: 1-ээс 10 түвшин. Загвар."><div><span>ТАНИЛЦАХ ЗАМ</span><span>01 — 10</span></div><ol>{Array.from({ length: 10 }, (_, i) => <li key={i} className={i === 0 ? styles.levelActive : undefined}>{String(i + 1).padStart(2, "0")}</li>)}</ol></div>;
}
