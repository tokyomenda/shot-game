import type { Metadata } from "next";
import SiteHeader from "@/components/social/SiteHeader";
import CategoryBrowser from "@/components/game/CategoryBrowser";
import { getGameCatalog } from "@/lib/game/catalog";
import styles from "@/components/game/Game.module.css";
export const metadata: Metadata = { title: "Тоглоомоо сонго — Халуун хөзөр" };
export default async function PlayPage() {
  const categories = (await getGameCatalog()).map(({ cards: _cards, ...summary }) => summary);
  return <div className={styles.shell}><SiteHeader back /><CategoryBrowser categories={categories} /><footer className={styles.footer}>ӨӨРИЙН ХЭМНЭЛЭЭР ТОГЛО. <span>✦</span> ҮДШИЙГ ЖААХАН ХАЛААЯ.</footer></div>;
}