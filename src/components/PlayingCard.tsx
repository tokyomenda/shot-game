import type { Card } from "@/data/cards";

type Props = { card?: Card; revealed?: boolean; leaving?: boolean; decorative?: boolean; onReveal?: () => void };

export default function PlayingCard({ card, revealed = false, leaving = false, decorative = false, onReveal }: Props) {
  return (
    <div className={`card-scene ${leaving ? "leaving" : ""} ${decorative ? "decorative" : ""}`}>
      <button className={`playing-card ${revealed ? "flipped" : ""}`} onClick={onReveal}
        disabled={decorative || revealed || leaving} tabIndex={decorative ? -1 : 0}
        aria-label={decorative ? "Чимэглэлийн хөзөр" : revealed ? card?.text : "Картаа нээ"}>
        <span className="card-face card-back" aria-hidden={revealed}>
          <span className="card-corner">✦</span>
          <span className="back-frame" />
          <span className="back-emblem"><span className="emblem-orbit" /><span className="star">✦</span></span>
          <span className="back-wordmark">ХАЛУУН<br />ХӨЗӨР</span>
          <span className="back-caption">ҮДШИЙН НУУЦ ЭНД БИЙ</span>
          <span className="card-corner bottom">✦</span>
        </span>
        <span className={`card-face card-front ${card?.type ?? "question"}`} aria-hidden={!revealed}>
          <span className="card-type"><span>✦</span> {card?.type === "challenge" ? "ДААЛГАВАР" : "АСУУЛТ"}</span>
          <span className="question-mark">{card?.type === "challenge" ? "↯" : "?"}</span>
          <span className="card-content">{card?.text}</span>
          <span className="card-footer">ҮНЭНЭЭ ХЭЛ. ӨӨРИЙГӨӨ СОРЬ.<span>✦</span></span>
        </span>
      </button>
    </div>
  );
}