import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Подтверждение email по token_hash через verifyOtp. В отличие от PKCE-обмена
// кода (exchangeCodeForSession в /auth/callback), этот способ НЕ требует code
// verifier из браузера, где была регистрация, — поэтому ссылка из письма
// работает, даже если её открыли в другом браузере или на другом устройстве.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Новичка (или незаполненный профиль) ведём сразу в Профиль — чтобы
      // заполнил имя/город и заодно заметил и выбрал язык. Остальных — как обычно.
      let dest = next;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, city")
          .eq("id", user.id)
          .maybeSingle<{ display_name: string | null; city: string | null }>();
        const incomplete =
          !profile || !profile.display_name?.trim() || !profile.city?.trim();
        if (incomplete) dest = "/profile";
      }
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
