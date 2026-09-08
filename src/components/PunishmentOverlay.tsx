import { useEffect, useRef } from "react";

type Props = { text: string; playerName: string; onComplete: () => void };

export default function PunishmentOverlay({ text, playerName, onComplete }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog ref={dialog} className="punishment-dialog" aria-labelledby="punishment-title"
      aria-describedby="punishment-text" onCancel={event => event.preventDefault()}>
      <div className="punishment-layout">
        <div className="punishment-meta"><span>{playerName}</span><span>+1 шийтгэл</span></div>
        <div className="punishment-heading">
          <span className="punishment-symbol" aria-hidden="true">✦</span>
          <div className="eyebrow">ОДОО Л ЗҮРХ ГАРГАНА ДАА</div>
          <h2 id="punishment-title">ШИЙТГЭЛ</h2>
        </div>
        <div className="punishment-card"><span aria-hidden="true">✦</span><p id="punishment-text">{text}</p><span aria-hidden="true">✦</span></div>
        <div className="punishment-complete">
          <p>Биелүүлээд дараагийн тоглогчдоо шилжүүлээрэй.</p>
          <button className="button primary" onClick={onComplete}>ШИЙТГЭЛ БИЕЛҮҮЛСЭН</button>
        </div>
      </div>
    </dialog>
  );
}