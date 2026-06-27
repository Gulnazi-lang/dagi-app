export type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  city: string | null;
  district: string | null;
  avatar_url: string | null;
  bio: string | null;
  traits: Record<string, string[]> | null; // анкета «о себе» (см. lib/traits.ts)
  created_at: string;
  updated_at: string;
};

export type WishStatus = "active" | "done" | "cancelled";

// Строка результата RPC find_matches (совпавшее чужое желание + профиль).
export type Match = {
  my_wish_id: string;
  my_activity: string;
  my_city: string;
  my_district: string | null;
  my_wish_date: string | null;
  my_wish_time: string | null;
  match_wish_id: string;
  match_user_id: string;
  activity: string;
  city: string;
  district: string | null;
  wish_date: string | null;
  wish_time: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export type TeamMemberStatus = "invited" | "accepted" | "declined";

export type Team = {
  id: string;
  creator_id: string;
  activity: string;
  city: string;
  district: string | null;
  wish_date: string | null;
  wish_time: string | null;
  status: string;
  created_at: string;
};

// Агрегат репутации из view user_reputation.
export type Reputation = {
  user_id: string;
  up: number;
  ok: number;
  down: number;
  attended: number;
  missed: number;
};

export type Message = {
  id: string;
  team_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type Wish = {
  id: string;
  user_id: string;
  activity: string;
  city: string;
  district: string | null;
  radius_km: number;
  wish_date: string | null; // YYYY-MM-DD или null = «любой день»
  wish_time: string | null; // HH:MM:SS или null = «время не важно»
  status: WishStatus;
  created_at: string;
  lat?: number | null;
  lng?: number | null;
};
