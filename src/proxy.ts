import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Все пути, кроме статики и иконок/манифеста/sw.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.svg|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
