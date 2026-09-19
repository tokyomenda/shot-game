import styles from "../social/Social.module.css";
import type { DiscoveryDecision } from "./types";

export default function ProfileActions({ onDecide }: { onDecide: (decision: DiscoveryDecision) => void }) {
  return <div className={styles.profileActions}><button onClick={() => onDecide("skip")}><span aria-hidden="true">×</span> АЛГАСАХ</button><button className={styles.interested} onClick={() => onDecide("interested")}><span aria-hidden="true">♡</span> СОНИРХОЖ БАЙНА</button></div>;
}
