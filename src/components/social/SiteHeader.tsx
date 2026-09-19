import Link from "next/link";
import styles from "./Social.module.css";

export default function SiteHeader({ back = false }: { back?: boolean }) {
  return <header className={styles.header}>
    <Link href="/" className={styles.logo} aria-label="Халуун — үндсэн нүүр"><span>✦</span> ХАЛУУН<span className={styles.logoDot}>.</span></Link>
    <div className={styles.headerRight}>{back && <Link href="/" className={styles.back}>← Нүүр</Link>}<span className={styles.age}>18+</span></div>
  </header>;
}
