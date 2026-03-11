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
    key,
    initialState: defaultPreferences[key],
  });
}

/**import { useLocalState } from "@daviapps/react-utils/hooks";
import { createContext, PropsWithChildren, useContext } from "react";

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

type PreferenceContextState<K extends keyof Preferences> = [
  Preferences[K],
  React.Dispatch<React.SetStateAction<Preferences[K]>>,
];

const PreferenceContext = createContext<PreferenceContextState<
  keyof Preferences
> | null>(null);

export function usePreference<K extends keyof Preferences>(key: K) {
  const context = useContext(PreferenceContext);
  if (!context) throw new Error("PreferenceProvider is required");
  return context as unknown as PreferenceContextState<K>;

  // return 
}

export function PreferenceProvider({ children}: PropsWithChildren){
  const state = useLocalState({
    key: "preferences",
    initialState: defaultPreferences[key],
  });
  return <PreferenceContext.Provider>
    {children}
  </PreferenceContext.Provider>
}
 */
