"use client";

import { chooseCityHeader, isCityHeaderCity, isCityHeaderMood, type CityHeaderSelection } from "./city-header";

const selections = new Map<string, CityHeaderSelection>();
const listeners = new Map<string, Set<() => void>>();
const storageKey = (scope: string) => `dud:city-header:v1:${scope}`;

function persist(scope: string, selection: CityHeaderSelection) {
  try {
    sessionStorage.setItem(storageKey(scope), JSON.stringify(selection));
  } catch {
    // Storage may be unavailable; the in-memory choice still survives client navigation.
  }
}

function restore(scope: string): CityHeaderSelection | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey(scope)) ?? "null");
    if (value && typeof value === "object" && "city" in value && "mood" in value
      && isCityHeaderCity(value.city) && isCityHeaderMood(value.mood)) {
      return { city: value.city, mood: value.mood };
    }
  } catch {
    // A corrupt or blocked storage entry should not prevent the app from opening.
  }
  return null;
}

export function getCityHeaderSnapshot(scope: string): CityHeaderSelection | null {
  return selections.get(scope) ?? null;
}

export function subscribeCityHeader(scope: string, homeCity: string | null | undefined, listener: () => void) {
  const subscribers = listeners.get(scope) ?? new Set<() => void>();
  listeners.set(scope, subscribers);
  subscribers.add(listener);
  if (!selections.has(scope)) {
    const selection = restore(scope) ?? chooseCityHeader(homeCity);
    selections.set(scope, selection);
    persist(scope, selection);
  }
  listener();
  return () => { subscribers.delete(listener); };
}

// Used by the local gallery's "new opening" control; real navigation never calls this.
export function renewCityHeader(scope: string, homeCity: string | null | undefined) {
  const selection = chooseCityHeader(homeCity, Math.random, selections.get(scope)?.city);
  selections.set(scope, selection);
  persist(scope, selection);
  listeners.get(scope)?.forEach((listener) => listener());
}
