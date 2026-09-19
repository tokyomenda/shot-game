export const genders = ["woman", "man", "nonbinary"] as const;
export const preferences = ["woman", "man", "everyone"] as const;
export type ProfileInput = {
  display_name: string; birth_date: string; gender: string; interested_in: string;
  city: string; bio: string; interests: string[]; contact_information: string;
};

export function ageOnDate(birthDate: string, today = new Date()): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return NaN;
  const date = new Date(birthDate + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) return NaN;
  const year = today.getUTCFullYear(), month = today.getUTCMonth(), day = today.getUTCDate();
  return year - date.getUTCFullYear() - (month < date.getUTCMonth() || (month === date.getUTCMonth() && day < date.getUTCDate()) ? 1 : 0);
}

export function validateProfile(input: ProfileInput): string | null {
  const age = ageOnDate(input.birth_date);
  if (!Number.isFinite(age) || age < 18 || age > 120) return "Профайл үүсгэхийн тулд 18 нас хүрсэн байх ёстой. Төрсөн огноогоо шалгана уу.";
  if (input.display_name.trim().length < 2 || input.display_name.trim().length > 40) return "Нэр 2–40 тэмдэгттэй байна.";
  if (!(genders as readonly string[]).includes(input.gender) || !(preferences as readonly string[]).includes(input.interested_in)) return "Хүйс болон сонирхож буй хүнээ сонгоно уу.";
  if (!input.city.trim() || input.city.trim().length > 80) return "Хотын нэрээ оруулна уу (80 хүртэл тэмдэгт).";
  if (!input.bio.trim() || input.bio.trim().length > 400) return "Товч танилцуулга 1–400 тэмдэгттэй байна.";
  if (!input.interests.length || input.interests.length > 10 || input.interests.some(item => !item.trim() || item.length > 30)) return "1–10 сонирхол оруулна уу. Тус бүр 30 хүртэл тэмдэгттэй байна.";
  if (input.contact_information.length > 1000) return "Холбоо барих мэдээлэл 1000 хүртэл тэмдэгттэй байна.";
  return null;
}

export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "JPG, PNG эсвэл WebP зураг сонгоно уу.";
  if (file.size === 0 || file.size > 5 * 1024 * 1024) return "Зураг 5 MB-аас ихгүй, хоосон биш байх ёстой.";
  return null;
}