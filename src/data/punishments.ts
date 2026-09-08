export type Punishment = { id: number; text: string };
export type NamedPlayer = { id: number; name: string };
export type PlayerPlaceholders = { currentPlayer: string; otherPlayer: string };

export const punishments: Punishment[] = [
  "{otherPlayer}-ийг 15 секунд дуурай.",
  "{otherPlayer}-тай суудлаа соль.",
  "{otherPlayer} чамд нэг асуулт асууна. Үнэнээр хариул.",
  "{otherPlayer}-ийн сонгосон дуу дээр 20 секунд бүжиглэ.",
  "{currentPlayer}, 30 секунд инээхгүй суухыг оролд.",
  "{otherPlayer}-д 3 магтаал хэл.",
  "{otherPlayer}-ийг нүдээ аниад зур. Цаасгүй бол агаарт зурж үзүүл.",
  "{otherPlayer}-ийн сонгосон алдартныг дуурай.",
  "{otherPlayer}-тай 10 секунд ширтэлц.",
  "{otherPlayer} чамд нэг хөгжилтэй хоч өгнө. Тэр нэрээрээ өөрийгөө танилцуул.",
  "{currentPlayer}, дуртай хоолдоо зориулж 20 секунд хайрын үг хэл.",
  "{otherPlayer}-д зориулж хоёр мөртэй дуу зохиогоод дуул.",
  "{otherPlayer}-ийн хэлсэн гурван үгийг оруулж богино түүх зохио.",
  "{otherPlayer}-тай хамт таван секундийн ялалтын бүжиг зохио.",
  "{otherPlayer}-ийн сонгосон амьтан шиг 15 секунд хөдөл.",
  "{currentPlayer}, өөрийгөө хаан эсвэл хатан мэтээр сүртэй танилцуул.",
  "{otherPlayer}-д төсөөллийн цэцгийн баглаа өгөөд жүжигчилсэн үг хэл.",
  "{otherPlayer}-ийн гарын хөдөлгөөнийг толь шиг 20 секунд дага.",
  "{otherPlayer}-тай ээлжлэн нэг нэг үг хэлж хөгжилтэй өгүүлбэр зохио.",
  "{currentPlayer}, 15 секунд удаашруулсан бичлэг шиг бүжиглэ.",
  "{otherPlayer}-ийг киноны гол дүрд сонгосон найруулагч шиг тайлбарла.",
  "{otherPlayer}-ийн сонгосон энгийн зүйлийг 20 секунд сурталчил.",
  "{currentPlayer}, энэ үдшийн тухай мэдээг нэвтрүүлэгч шиг унш.",
  "{otherPlayer}-тай зөвхөн хөмсгөө хөдөлгөн 10 секунд ярилц.",
  "{otherPlayer}-д зохиомол шагнал гардуулж, яагаад хүртсэнийг нь хэл.",
  "{currentPlayer}, гурван өөр инээдийг дараалан үзүүл.",
  "{otherPlayer}-ийн нэрээр эхэлсэн дөрвөн мөрт шүлэг зохио.",
  "{otherPlayer}-ийн сонгосон дууг зөвхөн «ла» үеэр аял.",
  "{currentPlayer}, 20 секунд бүх үгээ дуулж хэл.",
  "{otherPlayer}-тай гар барих шинэ мэндчилгээ зохио. Хоёулаа үзүүл.",
  "{otherPlayer}-ийн сонгосон мэргэжлийг үггүй жүжиглэ. Бусад нь тааг.",
  "{currentPlayer}, төсөөллийн загварын тайз дээр гурван өөр поз ав.",
  "{otherPlayer}-д өөрийнхөө тухай хоёр үнэн, нэг худал зүйл хэл. Худлыг нь таалга.",
  "{otherPlayer}-ийг супер баатар болгоод нэр, чадварыг нь танилцуул.",
  "{currentPlayer}, инээдтэй царай гаргаад 15 секунд тэр хэвээрээ бай.",
  "{otherPlayer}-тай ээлжлэн таван төрлийн амьтны дуу гарга.",
  "{otherPlayer}-ийн хэлсэн өгүүлбэрийг баярласан, гайхсан, гомдсон өнгөөр давт.",
  "{currentPlayer}, төсөөллийн утсаар пицца захиал. Гэхдээ робот шиг ярь.",
  "{otherPlayer}-д энэ үдэшт зориулсан гурван хөгжилтэй зөвлөгөө өг.",
  "{otherPlayer}-ийн сонгосон өнгөтэй таван зүйлийг нэрлэ.",
  "{currentPlayer}, шагнал авсан мэт баярлаад 15 секунд талархлын үг хэл.",
  "{otherPlayer}-тай зөвхөн асуултаар дөрвөн өгүүлбэр солилц.",
  "{otherPlayer}-ийн дуртай хоолыг асуугаад түүний тухай богино рэп зохио.",
  "{currentPlayer}, {otherPlayer}-д зориулж цаг агаарын хөгжилтэй мэдээ зохио.",
  "{currentPlayer}, баруун гараараа агаарт дугуй, зүүн гараараа дөрвөлжин зэрэг зур.",
  "{otherPlayer}-тай хамт төсөөллийн хамтлаг байгуул. Нэр, анхны дуугаа зарла.",
  "{currentPlayer}, өрөөнд байгаа нэг зүйлийг музейн хөтөч шиг тайлбарла.",
  "{otherPlayer}-д өөрийнхөө хамгийн хөгжилтэй бүтэлгүйтлийг 30 секундэд ярь.",
].map((text, id) => ({ id, text }));

// Replace in one pass: names containing braces or dollar signs remain literal.
export function replacePlayerNames(text: string, names: PlayerPlaceholders): string {
  return text.replace(/\{(currentPlayer|otherPlayer)\}/g, (_, key: keyof PlayerPlaceholders) => names[key]);
}

export function resolvePunishment(text: string, players: readonly NamedPlayer[], currentPlayer: NamedPlayer): string {
  const others = players.filter(player => player.id !== currentPlayer.id);
  if (!others.length) throw new Error("Punishments require at least two players.");
  const otherPlayer = others[Math.floor(Math.random() * others.length)];
  return replacePlayerNames(text, { currentPlayer: currentPlayer.name, otherPlayer: otherPlayer.name });
}

export function shufflePunishments(previousId?: number): Punishment[] {
  const deck = [...punishments];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck[0].id === previousId) [deck[0], deck[1]] = [deck[1], deck[0]];
  return deck;
}

export type PunishmentDeck = { remaining: Punishment[]; previousId?: number };

export function drawPunishment(state: PunishmentDeck): { punishment: Punishment; deck: PunishmentDeck } {
  const available = state.remaining.length ? state.remaining : shufflePunishments(state.previousId);
  const [punishment, ...remaining] = available;
  return { punishment, deck: { remaining, previousId: punishment.id } };
}