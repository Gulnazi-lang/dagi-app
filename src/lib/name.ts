// Имя для показа другим пользователям: ник (если задан), иначе только имя —
// первое слово display_name, без фамилии (фамилию не показываем из приватности).
export function personName(
  p: { username?: string | null; display_name?: string | null },
  fallback = ""
): string {
  const nick = (p.username ?? "").trim();
  if (nick) return nick;
  const dn = (p.display_name ?? "").trim();
  if (dn) return dn.split(/\s+/)[0];
  return fallback;
}
