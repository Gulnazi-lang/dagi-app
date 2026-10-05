import { TabBar } from "@/components/TabBar";
import { BrandLogo, FriendsArt } from "@/components/Brand";
import { CityHeader, type CityHeaderProps } from "@/components/CityHeader";

export function AppShell({
  children,
  header,
  activePath,
  preview = false,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  activePath?: string;
  preview?: boolean;
}) {
  return (
    <div className="app-shell">
      {header}
      <main className="app-main">{children}</main>
      <TabBar activePath={activePath} preview={preview} />
    </div>
  );
}

export function TopBar({ title, description, actions, illustrated = false, cityHeader }: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  illustrated?: boolean;
  cityHeader?: CityHeaderProps;
}) {
  return (
    <header className={`top-bar ${illustrated || cityHeader ? "top-bar-illustrated" : ""} ${cityHeader ? "top-bar-cities" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <BrandLogo />
        {actions}
      </div>
      {title && (
        <div className="page-heading">
          <div className="min-w-0 flex-1">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {illustrated && !cityHeader && <FriendsArt className="heading-art" />}
        </div>
      )}
      {cityHeader && <CityHeader {...cityHeader} />}
    </header>
  );
}
