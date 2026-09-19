"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validatePhoto, validateProfile, type ProfileInput } from "./validation";
import type { DiscoveryProfile } from "@/components/meet/types";

export type OwnProfile = ProfileInput & { id: string; photo_path: string };
type PublicRow = { id: string; display_name: string; age: number; city: string; bio: string; interests: string[]; photo_path: string };

export async function loadOwnProfile(userId: string): Promise<OwnProfile | null> {
  const db = getSupabaseBrowserClient();
  const { data, error } = await db.from("profiles").select("id,display_name,birth_date,gender,interested_in,city,bio,interests,photo_path").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: contact, error: contactError } = await db.from("profile_contacts").select("contact_information").eq("user_id", userId).maybeSingle();
  if (contactError) throw contactError;
  return { ...data, contact_information: contact?.contact_information ?? "" } as OwnProfile;
}

export async function saveProfile(userId: string, input: ProfileInput, file: File | null, existingPath?: string) {
  const validation = validateProfile(input) || (file ? validatePhoto(file) : !existingPath ? "Профайл зураг сонгоно уу." : null);
  if (validation) throw new Error(validation);
  const db = getSupabaseBrowserClient();
  let path = existingPath;
  if (file) {
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    path = userId + "/" + crypto.randomUUID() + "." + extension;
    const { error } = await db.storage.from("profile-photos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
  }
  const { error } = await db.rpc("save_meet_profile", {
    p_display_name: input.display_name.trim(), p_birth_date: input.birth_date,
    p_gender: input.gender, p_interested_in: input.interested_in, p_city: input.city.trim(),
    p_bio: input.bio.trim(), p_interests: input.interests, p_photo_path: path,
    p_contact_information: input.contact_information.trim(),
  });
  // Keep uploaded objects on ambiguous network failure: the transaction may have committed.
  // Retries are safe; unreferenced objects can later be removed by an owner/admin cleanup job.
  if (error) throw error;
  if (file && existingPath && existingPath !== path) await db.storage.from("profile-photos").remove([existingPath]);
}

export async function loadDiscovery(): Promise<DiscoveryProfile[]> {
  const db = getSupabaseBrowserClient();
  const { data, error } = await db.rpc("discover_profiles");
  if (error) throw error;
  const rows = (data ?? []) as PublicRow[];
  if (!rows.length) return [];
  const { data: images, error: imageError } = await db.storage.from("profile-photos").createSignedUrls(rows.map(row => row.photo_path), 3600);
  if (imageError) throw imageError;
  return rows.map(row => ({
    id: row.id, name: row.display_name, age: row.age, location: row.city,
    bio: row.bio, interests: row.interests,
    photo: images?.find(image => image.path === row.photo_path)?.signedUrl ?? "",
    photoAlt: row.display_name + "-ийн профайл зураг",
  }));
}

export async function likeProfile(userId: string, targetId: string) {
  const { error } = await getSupabaseBrowserClient().from("likes").insert({ liker_id: userId, liked_id: targetId });
  if (error && error.code !== "23505") throw error;
}

export function meetError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (["42P01", "42883", "PGRST202", "PGRST205"].includes(code)) return "Өгөгдлийн сангийн тохиргоо бэлэн болоогүй байна. supabase/schema.sql файлыг SQL Editor дээр ажиллуулна уу.";
  if (code === "23514") return "Профайлын мэдээлэл шаардлага хангахгүй байна. Нас болон бөглөсөн талбаруудаа шалгана уу.";
  if (code === "42501") return "Энэ үйлдлийн эрх хүрэхгүй байна. Нэвтрэлт болон database policies-ийг шалгана уу.";
  return "Хүсэлтийг гүйцэтгэж чадсангүй. Холболт, Storage болон Supabase тохиргоогоо шалгаад дахин оролдоно уу.";
}