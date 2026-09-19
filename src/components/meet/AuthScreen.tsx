"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./Foundation.module.css";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim(), password = String(form.get("password"));
    setBusy(true); setError(""); setMessage("");
    try {
      const auth = getSupabaseBrowserClient().auth;
      const result = mode === "signup"
        ? await auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/meet" } })
        : await auth.signInWithPassword({ email, password });
      if (result.error) {
        const code = result.error.code;
        setError(code === "email_not_confirmed" ? "Имэйл хаягаа эхлээд баталгаажуулна уу." : code === "over_email_send_rate_limit" || code === "over_request_rate_limit" ? "Олон хүсэлт илгээгдлээ. Түр хүлээгээд дахин оролдоно уу." : mode === "login" ? "Нэвтэрч чадсангүй. Имэйл, нууц үг болон холболтоо шалгана уу." : "Бүртгэл үүсгэж чадсангүй. Имэйл, нууц үг болон холболтоо шалгана уу.");
      } else if (mode === "signup" && !result.data.session) {
        setMessage("Имэйлээ шалгаж, баталгаажуулах холбоосыг нээгээрэй. Өмнө бүртгэлтэй бол нэвтрэх хэсгийг ашиглана уу.");
      }
    } catch { setError("Холболт амжилтгүй боллоо. Дахин оролдоно уу."); }
    finally { setBusy(false); }
  }
  return <main className={styles.authLayout}><section className={styles.story}><span className={styles.eyebrow}>НЭГ ТАНИЛ. МЯНГАН БОЛОМЖ.</span><div className={styles.symbol} aria-hidden="true">♡<span>✦</span></div><h1>Шинэ түүхээ<br /><em>эндээс эхэл.</em></h1><p>Яарах хэрэггүй. Нэг асуулт, нэг хариулт.<br />Бие биенээ бага багаар нээх орон зай.</p><small>18+ · Өөрийн хэмнэлээр танилцаарай.</small></section>
    <section className={styles.panel}><div className={styles.tabs}><button aria-pressed={mode === "signup"} disabled={busy} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Бүртгүүлэх</button><button aria-pressed={mode === "login"} disabled={busy} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Нэвтрэх</button></div>
      <h2>{mode === "signup" ? "Танилцахад бэлэн үү?" : "Тавтай морил."}</h2><p className={styles.hint}>{mode === "signup" ? "Эхлээд өөрийн орон зайг үүсгэе." : "Таны дараагийн танил хүлээж байна."}</p>
      <form onSubmit={submit}><fieldset disabled={busy} className={styles.fields}><label>ИМЭЙЛ<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label><label>НУУЦ ҮГ<input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : 1} maxLength={128} required placeholder={mode === "signup" ? "8-аас доошгүй тэмдэгт" : "Нууц үгээ оруулна уу"} /></label>{mode === "signup" && <label className={styles.check}><input type="checkbox" required /> Би 18 нас хүрсэн.</label>}<p className={styles.error} role="alert">{error}</p><p className={styles.success} role="status">{message}</p><button className={styles.primary} type="submit">{busy ? "Түр хүлээнэ үү…" : mode === "signup" ? "БҮРТГҮҮЛЭХ ↗" : "НЭВТРЭХ ↗"}</button></fieldset></form><p className={styles.privacy}>Холбоо барих мэдээлэл тань профайл дээр нийтлэгдэхгүй.</p>
    </section></main>;
}