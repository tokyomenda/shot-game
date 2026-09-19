import { notFound } from "next/navigation";
import CategoryGame from "@/components/game/CategoryGame";
import { getGameCatalog } from "@/lib/game/catalog";


export async function generateStaticParams() {
  return (await getGameCatalog()).map(category => ({ categoryId: category.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = (await getGameCatalog()).find(item => item.id === categoryId);
  return { title: category ? category.name + " — Халуун хөзөр" : "Ангилал олдсонгүй" };
}
export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = (await getGameCatalog()).find(item => item.id === categoryId);
  if (!category) notFound();
  return <CategoryGame category={category} />;
}