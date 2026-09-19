import type { Metadata } from "next";
import MeetExperience from "@/components/meet/MeetExperience";
import SiteHeader from "@/components/social/SiteHeader";
import styles from "@/components/social/Social.module.css";


export const metadata: Metadata = { title: "Танилцах уу? — ХАЛУУН", description: "Нэг асуултаас эхлэх шинэ танил. Өөрийнхөөрөө танилцаарай." };

export default function MeetPage() {
  return <div className={styles.shell}><SiteHeader back /><MeetExperience /><footer className={styles.footer}><span>ЯАРАХ ХЭРЭГГҮЙ. ТАНИЛЦАХАД ЦАГ БИЙ.</span><span>✦ ХАЛУУН</span></footer></div>;
}