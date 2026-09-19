import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/social/Social.module.css";
import SiteHeader from "@/components/social/SiteHeader";

export const metadata: Metadata = { title: "ХАЛУУН — Өнөөдөр юу хийх вэ?", description: "Шинэ танил. Дотнын найзууд. Мартагдашгүй нэг үдэш." };

export default function Home() {
  return <div className={styles.shell}>
    <SiteHeader />
    <main className={styles.landing}>
      <div className={styles.kicker}><span /> ҮДЭШ ДӨНГӨЖ ЭХЭЛЖ БАЙНА</div>
      <h1 className={styles.headline}>ӨНӨӨДӨР<br /><span>ЮУ ХИЙХ ВЭ?</span><sup>✦</sup></h1>
      <p className={styles.intro}>Сайхан үдэш нэг сонголтоос эхэлдэг.</p>
      <div className={styles.choices}>
        <Link href="/meet" className={styles.choice}>
          <div className={styles.choiceMeta}><span>01 / ШИНЭ ТАНИЛ</span><span>ХОЁР ХҮН. НЭГ ЭХЛЭЛ.</span></div>
          <div className={styles.meetArt} aria-hidden="true"><div className={styles.orbit} /><div className={styles.orbitTwo} /><span className={styles.heart}>♡</span><span className={styles.artSpark}>✦</span><span className={styles.artNote}>a little chemistry.</span></div>
          <div className={styles.choiceBottom}><div><h2>ТАНИЛЦАХ УУ?</h2><p>Шинэ хүнтэй сонирхолтой байдлаар танилцаарай.</p></div><span className={styles.arrow}>↗</span></div>
        </Link>
        <Link href="/play" className={`${styles.choice} ${styles.playChoice}`}>
          <div className={styles.choiceMeta}><span>02 / ХАЛУУН ХӨЗӨР</span><span>НАЙЗУУДАА ЦУГЛУУЛ.</span></div>
          <div className={styles.playArt} aria-hidden="true"><div className={styles.miniCard}>✦</div><div className={styles.miniCard}><small>ХАЛУУН ХӨЗӨР</small><b>✦</b><small>ҮДШИЙН НУУЦ</small></div><span className={styles.artNote}>make it a night.</span></div>
          <div className={styles.choiceBottom}><div><h2>ТОГЛОХ УУ?</h2><p>Найзуудтайгаа Халуун хөзөр тоглоорой.</p></div><span className={styles.arrow}>↗</span></div>
        </Link>
      </div>
      <p className={styles.landingNote}>ШИНЭ ТҮҮХ ЭХЛҮҮЛ. <span>✦</span> ЭСВЭЛ ДУРСАМЖ БҮТЭЭ.</p>
    </main>
    <footer className={styles.footer}><span>ХАЛУУН — ҮДШИЙН ЧИНЬ ЭХЛЭЛ</span><span>ӨӨРИЙН ХЭМНЭЛЭЭР. ӨӨРИЙН СОНГОЛТООР.</span></footer>
  </div>;
}
