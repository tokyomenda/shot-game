"use client";

import { useEffect, useState, type FormEvent } from "react";
import { meetError, saveProfile, type OwnProfile } from "@/lib/meet/repository";
import { validatePhoto, validateProfile, type ProfileInput } from "@/lib/meet/validation";
import styles from "./Foundation.module.css";

export default function ProfileSetup({ userId, initial, onSaved, onCancel }: { userId: string; initial: OwnProfile | null; onSaved: () => void; onCancel?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!file) { setPreview(""); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const input: ProfileInput = { display_name: value("display_name"), birth_date: value("birth_date"), gender: value("gender"), interested_in: value("interested_in"), city: value("city"), bio: value("bio"), interests: [...new Set(value("interests").split(",").map(item => item.trim()).filter(Boolean))], contact_information: value("contact_information") };
    const validation = validateProfile(input);
    if (validation) { setError(validation); return; }
    setBusy(true); setError("");
    try { await saveProfile(userId, input, file, initial?.photo_path); onSaved(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : meetError(failure)); }
    finally { setBusy(false); }
  }
  return <main className={styles.setup}><span className={styles.eyebrow}>ЧИНИЙ ТУХАЙ ЖААХАН МЭДЬЕ</span><h1>{initial ? "Өөрийн профайл" : "Чамтай танилцъя."}</h1><p className={styles.hint}>Жинхэнэ танил өөрийнхөөрөө байхаас эхэлнэ.</p>
    <form className={styles.panel} onSubmit={submit}><fieldset className={styles.fields} disabled={busy}>
      <label className={styles.photo}>{preview ? <img src={preview} alt="Сонгосон зураг" /> : <span aria-hidden="true">＋</span>}<span>ПРОФАЙЛ ЗУРАГ<small>{initial ? "Шинэ зураг сонговол одоогийн зургийг солино." : "JPG, PNG, WebP · 5 MB хүртэл"}</small></span><input type="file" accept="image/jpeg,image/png,image/webp" required={!initial} onChange={event => { const selected = event.target.files?.[0] ?? null; if (selected) { const issue = validatePhoto(selected); if (issue) { setError(issue); event.target.value = ""; setFile(null); return; } } setError(""); setFile(selected); }} /></label>
      <div className={styles.twoColumns}><label>ХАРАГДАХ НЭР<input name="display_name" required minLength={2} maxLength={40} defaultValue={initial?.display_name} autoComplete="nickname" /></label><label>ТӨРСӨН ОГНОО<input name="birth_date" type="date" required defaultValue={initial?.birth_date} autoComplete="bday" /><small>Зөвхөн нас харагдана. Огноо нууц байна.</small></label>
      <label>ХҮЙС<select name="gender" required defaultValue={initial?.gender ?? ""}><option value="" disabled>Сонгох</option><option value="woman">Эмэгтэй</option><option value="man">Эрэгтэй</option><option value="nonbinary">Бусад</option></select></label><label>ХЭНТЭЙ ТАНИЛЦАХ ВЭ?<select name="interested_in" required defaultValue={initial?.interested_in ?? ""}><option value="" disabled>Сонгох</option><option value="woman">Эмэгтэй</option><option value="man">Эрэгтэй</option><option value="everyone">Бүгд</option></select></label></div>
      <label>ХОТ<input name="city" required maxLength={80} defaultValue={initial?.city} autoComplete="address-level2" /></label><label>ТОВЧ ТАНИЛЦУУЛГА<textarea name="bio" required maxLength={400} rows={3} defaultValue={initial?.bio} placeholder="Өөрийнхөө тухай сонирхолтой зүйл…" /><small>Холбоо барих мэдээллээ энд бүү оруулаарай.</small></label><label>СОНИРХЛУУД<input name="interests" required maxLength={308} defaultValue={initial?.interests.join(", ")} placeholder="Кофе, аялал, хөгжим" /><small>Таслалаар тусгаарлаарай. 1–10 сонирхол.</small></label>
      <label className={styles.privateField}>ХОЛБОО БАРИХ МЭДЭЭЛЭЛ · НУУЦ<textarea name="contact_information" maxLength={1000} rows={2} defaultValue={initial?.contact_information} placeholder="Утас, Instagram эсвэл бусад холбоос (заавал биш)" /><small>Зөвхөн танд харагдана. Ирээдүйд LEVEL 10 дуусаж, хоёр тал зөвшөөрсний дараа солилцох боломж нээгдэнэ.</small></label>
      <p className={styles.error} role="alert">{error}</p><button type="submit" className={styles.primary}>{busy ? "Хадгалж байна…" : "ПРОФАЙЛ ХАДГАЛАХ ↗"}</button>{onCancel && <button type="button" className={styles.secondary} onClick={onCancel}>Буцах</button>}
    </fieldset></form></main>;
}