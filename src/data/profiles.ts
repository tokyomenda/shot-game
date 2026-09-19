import type { DiscoveryProfile } from "@/components/meet/types";

// Fictional demo identities; stock portraits do not represent real members.
export const demoProfiles: readonly DiscoveryProfile[] = [
  { id: "demo-1", name: "Номин", age: 25, location: "Улаанбаатар", bio: "Кофе, жижигхэн аялал, удаан ярианд дуртай. Хотын хамгийн гоё нар жаргалтыг хамт хайх уу?", interests: ["Кофе", "Аялал", "Кино", "Гэрэл зураг"], photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85", photoAlt: "Демо профайлын эмэгтэйн хөрөг" },
  { id: "demo-2", name: "Тэмүүлэн", age: 27, location: "Улаанбаатар", bio: "Өдрийн цагаар дизайн, оройдоо амьд хөгжим. Амралтын өдрийг шинэ замаар алхаж өнгөрүүлдэг.", interests: ["Дизайн", "Амьд хөгжим", "Алхалт"], photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85", photoAlt: "Демо профайлын эрэгтэйн хөрөг" },
  { id: "demo-3", name: "Ану", age: 24, location: "Улаанбаатар", bio: "Номын дэлгүүрт төөрөх дуртай. Чиний дахин дахин сонсдог дууг мэдмээр байна.", interests: ["Ном", "Хөгжим", "Урлаг"], photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85", photoAlt: "Демо профайлын эмэгтэйн хөрөг" },
];
