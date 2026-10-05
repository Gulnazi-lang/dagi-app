import { notFound } from "next/navigation";
import { DesignPreview } from "@/components/DesignPreview";

export const dynamic = "force-dynamic";

// Local review only. This route is unavailable in a production build.
export default async function DesignPreviewPage({ searchParams }: {
  searchParams: Promise<{ screen?: string; activity?: string; headerCity?: string; headerMood?: string; homeCity?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  return <DesignPreview screen={params.screen ?? "wishes"} activity={params.activity} headerCity={params.headerCity} headerMood={params.headerMood} homeCity={params.homeCity} />;
}
