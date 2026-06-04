import { cookies, headers } from "next/headers";
import { isLocale, detectLocale, LOCALE_COOKIE, type Locale } from "./locale";
import { translate } from "./translations";

// Текущий язык для серверных компонентов: cookie (если пользователь выбрал),
// иначе автоопределение по заголовку Accept-Language.
export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const fromCookie = c.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const h = await headers();
  return detectLocale(h.get("accept-language"));
}

// Хелпер: { locale, t } для серверных компонентов.
export async function getT(): Promise<{
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
}> {
  const locale = await getLocale();
  return {
    locale,
    t: (key, params) => translate(locale, key, params),
  };
}
