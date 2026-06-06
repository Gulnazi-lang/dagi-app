import { AppShell, TopBar } from "@/components/AppShell";
import { ListSkeleton } from "@/components/Skeleton";

// Мгновенная заглушка для главной + fallback для вложенных страниц без своего loading.
export default function Loading() {
  return (
    <AppShell header={<TopBar />}>
      <ListSkeleton />
    </AppShell>
  );
}
