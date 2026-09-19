import styles from "../social/Social.module.css";
import type { DiscoveryDecision } from "./types";

export default function ProfileActions({ onDecide, disabled = false }: { onDecide: (decision: DiscoveryDecision) => void; disabled?: boolean }) {
  return <div className={styles.profileActions}><button disabled={disabled} onClick={() => onDecide("skip")}><span aria-hidden="true">×</span> АЛГАСАХ</button><button disabled={disabled} className={styles.interested} onClick={() => onDecide("interested")}><span aria-hidden="true">♡</span> СОНИРХОЖ БАЙНА</button></div>;
}