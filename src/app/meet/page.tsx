import type { Metadata } from "next";
import Discovery from "@/components/meet/Discovery";
import SiteHeader from "@/components/social/SiteHeader";
import styles from "@/components/social/Social.module.css";
import { demoProfiles } from "@/data/profiles";

export const metadata: Metadata = { title: "Танилцах уу? — ХАЛУУН", description: "Нэг асуултаас эхлэх шинэ танил. Танилцах хэсгийн загвар." };

export default function MeetPage() {
  return <div className={styles.shell}><SiteHeader back /><Discovery profiles={demoProfiles} /><footer className={styles.footer}><span>ЯАРАХ ХЭРЭГГҮЙ. ТАНИЛЦАХАД ЦАГ БИЙ.</span><span>✦ ХАЛУУН</span></footer></div>;
}
