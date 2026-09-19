"use client";

import { useState } from "react";
import type { DiscoveryProfile } from "./types";
import styles from "../social/Social.module.css";

export default function ProfileCard({ profile, demo = true }: { profile: DiscoveryProfile; demo?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <article className={styles.profile} aria-labelledby="profile-name">
    {failed || !profile.photo ? <div className={styles.photoFallback} role="img" aria-label={profile.photoAlt}><span>{profile.name.charAt(0)}</span><small>Зураг ачаалагдсангүй</small></div> : <img className={styles.profilePhoto} src={profile.photo} alt={profile.photoAlt} width={900} height={1100} onError={() => setFailed(true)} />}
    <div className={styles.profileShade} />
    <span className={styles.demoBadge}>{demo ? "DEMO PROFILE" : "ШИНЭ ТАНИЛ"}</span>
    <span className={styles.profileSpark} aria-hidden="true">✦</span>
    <div className={styles.profileInfo}><p className={styles.location}>⌖ {profile.location}</p><h2 id="profile-name">{profile.name} <span>{profile.age}</span></h2><p className={styles.bio}>{profile.bio}</p><ul className={styles.interests}>{profile.interests.map(interest => <li key={interest}>{interest}</li>)}</ul></div>
  </article>;
}