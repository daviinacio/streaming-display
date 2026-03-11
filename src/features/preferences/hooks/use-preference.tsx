import { useLocalState } from "@daviapps/react-utils/hooks";

export type Preferences = {
  theme: "system" | "light" | "dark";
  locale: string;
  "color-primary": string;
  "fit-video": boolean;
};

const defaultPreferences: Preferences = {
  theme: "system",
  locale: "system",
  "fit-video": false,
  "color-primary": "206 100% 57%",
};

export function usePreference<K extends keyof Preferences>(key: K) {
  return useLocalState<Preferences[K]>({
    key: `preference-${key}`,
    initialState: defaultPreferences[key],
  });
}
