import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
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
