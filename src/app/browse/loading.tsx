import { AppShell, TopBar } from "@/components/AppShell";
import { ListSkeleton } from "@/components/Skeleton";
import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <AppShell header={<TopBar title={t("browse.title")} />}>
      <ListSkeleton />
    </AppShell>
  );
}
