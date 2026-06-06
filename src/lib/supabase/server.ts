import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Личность пользователя из проверенного JWT (claims), БЕЗ сетевого запроса к
 * Supabase Auth — в отличие от `getUser()`, который ходит на сервер каждый раз.
 * Реальную валидацию и refresh сессии делает middleware (один getUser за запрос);
 * страницам достаточно локально достать id/email из токена. Это убирает второй
 * сетевой round-trip на каждом переходе между вкладками.
 */
export async function getAuthUser(
  supabase: SupabaseServerClient
): Promise<{ id: string; email: string } | null> {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Вызвано из Server Component — обновление сессии берёт на себя middleware.
          }
        },
      },
    }
  );
}
