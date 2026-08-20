import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// profiles закрыт RLS-политикой "to authenticated" — анонимный ключ не прочитает
// ни строки (и не докажет живость БД), поэтому здесь service role.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdmin(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });
    const { error } = await admin
      .from("profiles")
      .select("id", { head: true, count: "exact" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Keepalive failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
