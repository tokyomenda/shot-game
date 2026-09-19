"use client";

import Link from "next/link";
import { shuffleCards, type Category, type SourceCard } from "@/lib/game/csv";
import gameStyles from "./game/Game.module.css";
import { useEffect, useRef, useState } from "react";
import PlayingCard from "./PlayingCard";
import PunishmentOverlay from "./PunishmentOverlay";
import { drawPunishment, resolvePunishment, type PunishmentDeck } from "@/data/punishments";
import { cards, shuffleDeck, type Card } from "@/data/cards";

type Player = { id: number; name: string; shots: number };
type Screen = "home" | "setup" | "game" | "results";
type Phase = "hidden" | "revealed" | "leaving" | "penalty";

function Brand() { return <span className="brand"><span>✦</span> ХАЛУУН ХӨЗӨР</span>; }

export default function PartyGame({ category }: { category?: Category }) {
  const [screen, setScreen] = useState<Screen>(category ? "setup" : "home");
  const [names, setNames] = useState<string[]>(Array(category?.minPlayers ?? 2).fill(""));
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [deck, setDeck] = useState<(Card & Partial<SourceCard>)[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [confirmExit, setConfirmExit] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const punishmentDeck = useRef<PunishmentDeck>({ remaining: [] });
  const [punishmentText, setPunishmentText] = useState<string | null>(null);
  const exitDialog = useRef<HTMLDialogElement>(null);
  const active = players[turn % players.length];
  const round = players.length ? Math.floor(turn / players.length) + 1 : 1;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (confirmExit) exitDialog.current?.showModal();
    else exitDialog.current?.close();
  }, [confirmExit]);

  function startGame() {
    const clean = names.map(name => name.trim());
    if (category && (clean.length < category.minPlayers || clean.length > category.maxPlayers)) { setError(`${category.minPlayers}–${category.maxPlayers} тоглогч шаардлагатай.`); return; }
    if (clean.some(name => !name)) { setError("Тоглогч бүрийн нэрийг оруулаарай."); return; }
    if (new Set(clean.map(name => name.toLocaleLowerCase())).size !== clean.length) {
      setError("Ялгахад хялбар байлгахын тулд өөр өөр нэр оруулаарай."); return;
    }
    setPlayers(clean.map((name, id) => ({ id, name, shots: 0 })));
    setDeck(category ? shuffleCards(category.cards) : shuffleDeck()); setCardIndex(0); setTurn(0); setPhase("hidden");
    punishmentDeck.current = { remaining: [] }; setPunishmentText(null);
    locked.current = false; setError(""); setScreen("game");
  }

  function finishTurn() {
    setPhase("leaving");
    timer.current = setTimeout(() => {
      if (cardIndex + 1 >= deck.length) { if (category) setScreen("results"); else { setDeck(shuffleDeck(deck[cardIndex].id)); setCardIndex(0); } }
      else setCardIndex(index => index + 1);
      timer.current = null;
      setTurn(value => value + 1); setPhase("hidden"); locked.current = false;
    }, 440);
  }

  function advance(penalty: boolean) {
    if (locked.current || phase !== "revealed") return;
    locked.current = true;
    if (penalty) {
      const result = drawPunishment(punishmentDeck.current);
      punishmentDeck.current = result.deck;
      setPunishmentText(resolvePunishment(result.punishment.text, players, active));
      setPlayers(current => current.map(player => player.id === active.id ? { ...player, shots: player.shots + 1 } : player));
      setPhase("penalty");
      // No timer here: the current turn remains active until completion.
      return;
    }
    finishTurn();
  }

  function completePunishment() {
    if (phase !== "penalty" || punishmentText === null || timer.current !== null) return;
    setPunishmentText(null);
    finishTurn();
  }

  const highest = Math.max(0, ...players.map(player => player.shots));

  return (
    <main className={`app-shell screen-${screen}`}>
      <header className="topbar">
        {screen === "setup" && category ? <Link href="/play" className={gameStyles.back} aria-label="Ангилал сонгох">←</Link> : screen === "setup" ? <button className="icon-button" onClick={() => setScreen("home")} aria-label="Нүүр хуудас руу буцах">←</button> : <Brand />}
        {screen === "game" ? <button className="quiet-button" disabled={phase === "leaving" || phase === "penalty"} onClick={() => setConfirmExit(true)}>Дуусгах ↗</button> : <span className="age-tag">18+</span>}
      </header>
      {category && <p className={gameStyles.categoryTitle}>{category.name}</p>}

      {screen === "home" && <section className="home page-enter">
        <div className="eyebrow"><span className="live-dot" /> НАЙЗУУД. НЭГ ҮДЭШ. ОЛОН НУУЦ.</div>
        <h1>ХАЛУУН<br /><span>ХӨЗӨР<span className="title-spark">✦</span></span></h1>
        <p className="subtitle">Асуултаа хариул. Даалгавраа биелүүл.<br />Үгүй бол шийтгэлтэй.</p>
        <div className="hero-cards" aria-hidden="true"><div className="ghost-card ghost-left" /><div className="ghost-card ghost-right" /><PlayingCard decorative /><span className="floating-spark spark-one">✧</span><span className="floating-spark spark-two">✦</span><span className="hero-sticker">ЗҮРХЛЭХ ҮҮ?</span></div>
        <div className="home-bottom"><div className="game-facts"><span>2–10 тоглогч</span><i /> <span>{cards.length} карт</span><i /><span>Хязгааргүй хөгжил</span></div>
          <button className="button primary" onClick={() => setScreen("setup")}>ТОГЛОХ <span>↗</span></button>
          <p className="fine-print">Өөрийн хэмнэлээр тогло. Шийтгэлээ ундаагүйгээр ч тохирч болно.</p>
        </div>
      </section>}

      {screen === "setup" && <section className="setup page-enter">
        <div className="eyebrow">ЭХЛЭЭД ТАНИЛЦЪЯ</div><h2>Өнөө орой<br /><em>хэн тоглох вэ?</em></h2>
        <p className="subtitle">Найзуудаа нэм. Хөзөр үлдсэнийг нь шийднэ.</p>
        <form onSubmit={event => { event.preventDefault(); startGame(); }}>
          <div className="section-label"><span>ТОГЛОГЧИД</span><span>{names.length} / {category?.maxPlayers ?? 10}</span></div>
          <div className="player-inputs">{names.map((name, index) => <div className="player-input" key={index}>
            <span className="avatar">{String(index + 1).padStart(2, "0")}</span>
            <input aria-label={`${index + 1}-р тоглогчийн нэр`} placeholder={`${index + 1}-р тоглогчийн нэр`} value={name} maxLength={24} autoComplete="off" onChange={event => { setNames(current => current.map((value, i) => i === index ? event.target.value : value)); setError(""); }} />
            <button type="button" className="remove-player" aria-label={`${index + 1}-р тоглогчийг хасах`} disabled={names.length <= (category?.minPlayers ?? 2)} onClick={() => setNames(current => current.filter((_, i) => i !== index))}>×</button>
          </div>)}</div>
          {names.length < (category?.maxPlayers ?? 10) && <button type="button" className="button add-button" onClick={() => setNames(current => [...current, ""])}><span>＋</span> Тоглогч нэмэх</button>}
          <p className="form-error" role="alert">{error}</p>
          <div className="rule-note"><span>✦</span><p>Ээлжээр картаа нээнэ.<br /><strong>Хариулна, биелүүлнэ эсвэл 1 шийтгэл авна.</strong></p></div>
          <button type="submit" className="button primary">ТОГЛООМ ЭХЛҮҮЛЭХ <span>↗</span></button>
        </form>
      </section>}

      {screen === "game" && active && <section className="game page-enter">
        {category && <div className={gameStyles.progress}><progress aria-label="Тоглоомын явц" value={cardIndex + 1} max={deck.length} /><span style={{ whiteSpace: "nowrap" }}>{cardIndex + 1} / {deck.length}</span></div>}
        <div className="game-status"><span><b>{String(round).padStart(2, "0")}</b> ДУГААР ТОЙРОГ</span><span>🥃 <b>{active.shots}</b> шийтгэл</span></div>
        <div className="turn-heading" aria-live="polite"><div className="eyebrow">ОДОО ЧИНИЙ ЭЭЛЖ</div><h2>{active.name}<span>-ийн ээлж</span></h2></div>
        <div className="game-card-wrap"><PlayingCard key={turn} card={deck[cardIndex]} revealed={phase !== "hidden"} leaving={phase === "leaving"} onReveal={() => { if (!locked.current) setPhase("revealed"); }} /></div>
        {category && <div className={gameStyles.metadata}><span>{deck[cardIndex].difficulty}</span><span>{deck[cardIndex].players} тоглогч</span><span>{deck[cardIndex].action}</span></div>}
        <div className="card-actions">{phase === "hidden" ? <div className="reveal-prompt"><span>↑</span><h3>КАРТАА НЭЭ</h3><p>Хөзөр дээр товшоод зориг гарга.</p></div> : <div className="revealed-actions page-enter"><button className="button primary" disabled={phase !== "revealed"} onClick={() => advance(false)}>{category ? ({ answer: "ХАРИУЛСАН", do: "БИЕЛҮҮЛСЭН", choose: "СОНГОСОН", vote: "САНАЛ ӨГСӨН" }[deck[cardIndex].action ?? ""] ?? "БИЕЛҮҮЛСЭН") : "БИЕЛҮҮЛСЭН"} <span>✓</span></button><button className="button penalty-button" disabled={phase !== "revealed"} onClick={() => advance(true)}>1 SHOT <span>🥃</span></button></div>}</div>
        {category && <button className={gameStyles.pass} disabled={phase !== "revealed"} onClick={() => advance(false)}>PASS · Алгасах</button>}
        <div className="turn-order" aria-label="Тоглогчдын дараалал">{players.map(player => <span key={player.id} className={player.id === active.id ? "current" : ""}>{player.name}</span>)}</div>
      </section>}

      {screen === "results" && <section className="results page-enter"><div className="result-icon">✦</div><div className="eyebrow">САЙХАН ҮДЭШ БАЙЛАА</div><h2>Хөзөр дууслаа.<br /><em>Дурсамж үлдлээ.</em></h2><p className="subtitle">{turn + (category && phase === "revealed" ? 1 : 0)} карт нээж, {players.reduce((sum, player) => sum + player.shots, 0)} шийтгэл авлаа.</p>
        <div className="scoreboard">{[...players].sort((a, b) => b.shots - a.shots).map((player, index) => <div className={`score-row ${highest > 0 && player.shots === highest ? "winner" : ""}`} key={player.id}><span className="avatar">{highest > 0 && player.shots === highest ? "♛" : String(index + 1).padStart(2, "0")}</span><div><strong>{player.name}</strong>{highest > 0 && player.shots === highest && <small>Үдшийн зоригтон</small>}</div><span className="score">{player.shots}<small>шийтгэл</small></span></div>)}</div>
        {highest === 0 && <p className="zero-message">Бүгд даалгавраа биелүүлжээ. Ямар зоригтой баг вэ! ✦</p>}
        <button className="button primary" onClick={startGame}>ДАХИН ТОГЛОХ <span>↻</span></button><button className="button text-button" onClick={() => setScreen("setup")}>Тоглогчдоо өөрчлөх</button>{category && <Link href="/play" className={gameStyles.resultLink}>Өөр ангилал сонгох ↗</Link>}
      </section>}

      {phase === "penalty" && screen === "game" && punishmentText !== null && <PunishmentOverlay text={punishmentText} playerName={active.name} onComplete={completePunishment} />}
      <dialog ref={exitDialog} className="exit-dialog" onCancel={() => setConfirmExit(false)} aria-labelledby="exit-title"><h2 id="exit-title">Тоглоомоо дуусгах уу?</h2><p>Одоогийн үр дүнгээ хамтдаа харцгаая.</p><button className="button primary" onClick={() => { setConfirmExit(false); setScreen("results"); }}>Үр дүн харах</button><button className="button text-button" onClick={() => setConfirmExit(false)}>Үргэлжлүүлэх</button></dialog>
      <footer className="app-footer">ҮДШИЙГ ЖААХАН ХАЛААЯ <span>✦</span></footer>
    </main>
  );
}