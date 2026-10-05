"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell, TopBar } from "@/components/AppShell";
import { WishesView } from "@/components/WishesView";
import { WishForm } from "@/components/WishForm";
import { MatchesView } from "@/components/MatchesView";
import { TeamsView } from "@/components/TeamsView";
import { ChatView } from "@/components/ChatView";
import { ProfileForm } from "@/components/ProfileForm";
import { EmptyState } from "@/components/EmptyState";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useI18n } from "@/lib/i18n/client";
import type { Wish, Profile } from "@/lib/types";
import { CITY_HEADER_IDS, cityHeaderLabel, isCityHeaderCity, isCityHeaderMood, type CityHeaderCity, type CityHeaderMood } from "@/lib/city-header";
import { renewCityHeader } from "@/lib/city-header-session";

const screens = [
  ["wishes", "Желания · примеры карточек"], ["empty", "Желания · пустой список"],
  ["new", "Создание желания"], ["edit", "Редактирование желания"],
  ["browse", "Все желания"], ["matches", "Совпадения"], ["teams", "Команды"],
  ["chat", "Чат"], ["profile", "Профиль"], ["login", "Вход / регистрация"],
];

// Explicit local design fixtures; never queried from or inserted into Supabase.
function exampleWishes(): Wish[] {
  const day = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  return [
    { id: "example-park", user_id: "local-preview", activity: "walk_park", city: "Рига", district: "Плявниеки", radius_km: 10, wish_date: day(0), wish_time: null, status: "active", created_at: "" },
    { id: "example-coffee", user_id: "local-preview", activity: "coffee", city: "Рига", district: "Центр", radius_km: 5, wish_date: day(1), wish_time: "18:00:00", status: "active", created_at: "" },
  ];
}

const emptyProfile: Profile = {
  id: "local-preview", display_name: null, username: null, city: "Рига", district: null,
  avatar_url: null, bio: null, traits: null, lat: null, lng: null, created_at: "", updated_at: "",
};

export function DesignPreview({ screen, activity, headerCity, headerMood, homeCity }: {
  screen: string;
  activity?: string;
  headerCity?: string;
  headerMood?: string;
  homeCity?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [previewHomeCity, setPreviewHomeCity] = useState(homeCity ?? "Рига");
  const [previewCity, setPreviewCity] = useState<CityHeaderCity | "auto">(isCityHeaderCity(headerCity) ? headerCity : "auto");
  const [previewMood, setPreviewMood] = useState<CityHeaderMood>(isCityHeaderMood(headerMood) ? headerMood : "morning");
  const wishes = exampleWishes();
  const selectedScreen = screens.some(([key]) => key === screen) ? screen : "wishes";
  const activePath = ["new", "edit", "empty"].includes(selectedScreen) ? "/" : selectedScreen === "teams" || selectedScreen === "chat" ? "/chats" : selectedScreen === "wishes" ? "/" : `/${selectedScreen}`;
  const title = selectedScreen === "new" ? t("title.newWish")
    : selectedScreen === "edit" ? t("title.wish")
    : selectedScreen === "browse" ? t("browse.title")
    : selectedScreen === "matches" ? t("tab.matches")
    : selectedScreen === "teams" ? t("tab.teams")
    : selectedScreen === "chat" ? t("tab.teams")
    : selectedScreen === "profile" ? t("tab.profile") : t("home.title");
  const isHome = selectedScreen === "wishes" || selectedScreen === "empty";

  return (
    <div className="preview-container">
      <div className="preview-toolbar">
        <span>Локально · примеры без сохранения</span>
        <select aria-label="Экран для просмотра" value={selectedScreen} onChange={(event) => {
          if (event.target.value === "login") router.push("/login");
          else router.push(`/design-preview?screen=${event.target.value}`);
        }}>
          {screens.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {isHome && <details className="preview-city-controls">
          <summary>Города в шапке · посмотреть варианты</summary>
          <div className="preview-city-fields">
            <label>Город пользователя
              <select aria-label="Город пользователя" value={previewHomeCity} onChange={(event) => {
                setPreviewHomeCity(event.target.value);
                renewCityHeader("design-preview", event.target.value);
              }}>
                {CITY_HEADER_IDS.map((city) => <option key={city} value={cityHeaderLabel(city, "ru")}>{cityHeaderLabel(city, "ru")}</option>)}
                <option value="Лондон">Лондон · без своей иллюстрации</option>
                <option value="">Город не указан</option>
                {previewHomeCity && ![...CITY_HEADER_IDS.map((city) => cityHeaderLabel(city, "ru")), "Лондон"].includes(previewHomeCity) && <option value={previewHomeCity}>{previewHomeCity}</option>}
              </select>
            </label>
            <label>Иллюстрация
              <select aria-label="Иллюстрация города" value={previewCity} onChange={(event) => setPreviewCity(event.target.value as CityHeaderCity | "auto")}>
                <option value="auto">Автоматически · 50/50</option>
                {CITY_HEADER_IDS.map((city) => <option key={city} value={city}>{cityHeaderLabel(city, "ru")}</option>)}
                <option value="neutral">Нейтральный город</option>
              </select>
            </label>
            <label>Палитра иллюстрации
              <select aria-label="Палитра города" value={previewMood} disabled={previewCity === "auto"} onChange={(event) => setPreviewMood(event.target.value as CityHeaderMood)}>
                <option value="morning">Утро</option><option value="evening">Вечер</option>
              </select>
            </label>
            <button type="button" className="preview-new-opening" onClick={() => {
              setPreviewCity("auto");
              renewCityHeader("design-preview", previewHomeCity);
            }}>Новое открытие</button>
          </div>
        </details>}
      </div>
      <AppShell activePath={activePath} preview header={<TopBar title={title} actions={<LanguageSelect />} cityHeader={isHome ? {
        homeCity: previewHomeCity,
        scope: "design-preview",
        previewSelection: previewCity === "auto" ? undefined : { city: previewCity, mood: previewMood },
      } : undefined} />}>
        {isHome && <WishesView wishes={selectedScreen === "empty" ? [] : wishes} preview />}
        {selectedScreen === "new" && <WishForm preview defaultCity="Рига" />}
        {selectedScreen === "edit" && <WishForm preview wish={wishes.find((wish) => wish.activity === activity) ?? wishes[0]} />}
        {selectedScreen === "matches" && <MatchesView groups={[]} preview />}
        {selectedScreen === "teams" && <TeamsView teams={[]} myId="local-preview" preview />}
        {selectedScreen === "chat" && <ChatView teamId="local-preview" myId="local-preview" members={[]} initialMessages={[]} preview />}
        {selectedScreen === "profile" && <ProfileForm profile={emptyProfile} email="" preview />}
        {selectedScreen === "browse" && <>
          <label className="block"><span className="form-label">{t("wish.city")}</span><select className="input-field" defaultValue="all"><option value="all">{t("browse.allCities")}</option><option value="Рига">{t("wish.city")} · Riga</option></select></label>
          <p className="my-4 text-[14px] leading-relaxed text-muted">{t("browse.hint")}</p>
          <EmptyState title={t("home.noWishesTitle")} icon="search" />
        </>}
      </AppShell>
    </div>
  );
}
