"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loadDiscovery, loadOwnProfile, likeProfile, meetError, type OwnProfile } from "@/lib/meet/repository";
import type { DiscoveryProfile } from "./types";
import AuthScreen from "./AuthScreen";
import ProfileSetup from "./ProfileSetup";
import Discovery from "./Discovery";
import styles from "./Foundation.module.css";

function MemberExperience({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    async function load() {
      try {
        const own = await loadOwnProfile(userId);
        const discovery = own ? await loadDiscovery() : [];
        if (active) { setProfile(own); setProfiles(discovery); }
      } catch (failure) { if (active) setError(meetError(failure)); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [userId, revision]);

  async function logout() {
    setSigningOut(true); setLogoutError("");
    try {
      const { error: failure } = await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
      if (failure) setLogoutError("Гарч чадсангүй. Дахин оролдоно уу.");
    } catch { setLogoutError("Холболтоо шалгаад дахин оролдоно уу."); }
    finally { setSigningOut(false); }
  }

  return <><div className={styles.memberBar}><span>{profile?.display_name ?? "ТАНЫ ОРОН ЗАЙ"}</span><div>{profile && !editing && <button onClick={() => setEditing(true)}>Профайл засах</button>}<button disabled={signingOut} onClick={logout}>{signingOut ? "Гарч байна…" : "Гарах ↗"}</button></div></div><p className={styles.error} role="alert">{logoutError}</p>
    {loading ? <div className={styles.loading} role="status">Таны орон зайг бэлдэж байна…</div>
      : error ? <div className={styles.loading}><p role="alert">{error}</p><button className={styles.secondary} onClick={() => setRevision(value => value + 1)}>Дахин оролдох</button></div>
      : !profile || editing ? <ProfileSetup userId={userId} initial={profile} onSaved={() => { setEditing(false); setRevision(value => value + 1); }} onCancel={profile ? () => setEditing(false) : undefined} />
      : <Discovery key={revision} profiles={profiles} mode="live" onRefresh={() => setRevision(value => value + 1)} onDecision={async (targetId, decision) => { if (decision === "interested") await likeProfile(userId, targetId); }} />}
  </>;
}

export default function MeetExperience() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let events = 0;
    let unsubscribe: (() => void) | undefined;
    setError(""); setSession(undefined);
    try {
      const db = getSupabaseBrowserClient();
      const { data } = db.auth.onAuthStateChange((_event, next) => { events++; if (active) setSession(next); });
      unsubscribe = () => data.subscription.unsubscribe();
      const before = events;
      void db.auth.getSession().then(({ data, error: failure }) => {
        if (!active || events !== before) return;
        if (failure) setError("Нэвтрэлтийн төлөв шалгаж чадсангүй. Дахин оролдоно уу.");
        else setSession(data.session);
      }).catch(() => { if (active) setError("Нэвтрэлтийн төлөв шалгаж чадсангүй."); });
    } catch { setError("Supabase тохиргоо дутуу эсвэл буруу байна. Үндсэн .env.local файлаа шалгаад server-ээ дахин асаана уу."); }
    return () => { active = false; unsubscribe?.(); };
  }, [retry]);
  if (error) return <main className={styles.loading}><p role="alert">{error}</p><button className={styles.secondary} onClick={() => setRetry(value => value + 1)}>Дахин оролдох</button></main>;
  if (session === undefined) return <main className={styles.loading} role="status">Түр хүлээнэ үү…</main>;
  return session ? <MemberExperience key={session.user.id} userId={session.user.id} /> : <AuthScreen />;
}