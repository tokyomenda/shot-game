import Link from "next/link";
import PartyGame from "@/components/PartyGame";
import styles from "@/components/social/Social.module.css";

export default function PlayPage() {
  return <><nav className={styles.gameNav} aria-label="Үндсэн навигаци"><Link href="/">← Нүүр</Link></nav><PartyGame /></>;
}
