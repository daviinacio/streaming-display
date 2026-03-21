import React, {
  useCallback,
  createContext,
  useEffect,
  useState,
  useMemo,
} from "react";

import { Preferences, usePreference } from "@/features/preferences";
import { applyTheme } from "@/lib/theme.ts";

type Theme = Preferences["theme"];

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  isDarkMode: false,
  setTheme: () => null,
  toggleDarkMode: () => null,
};

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isBrowserDarkMode, setIsBrowserDarkMode] = useState(
    typeof window !== "undefined" && mediaQuery.matches,
  );

  useEffect(() => {
    function updateTheme(event: MediaQueryListEvent | MediaQueryList) {
      setIsBrowserDarkMode(event.matches);
    }

    mediaQuery.addEventListener("change", updateTheme);
    updateTheme(mediaQuery);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  const [theme, setPreferenceTheme] = usePreference("theme");

  useEffect(() => {
    const systemTheme = isBrowserDarkMode ? "dark" : "light";
    if (systemTheme === theme) setPreferenceTheme("system");
  }, [theme, isBrowserDarkMode]);

  const isDarkMode = useMemo(() => {
    return theme === "system" ? isBrowserDarkMode : theme === "dark";
  }, [theme, isBrowserDarkMode]);

  useEffect(() => {
    applyTheme({ isDarkMode });
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? "light" : "dark");
  }, [isBrowserDarkMode, isDarkMode]);

  const setTheme = useCallback((theme: Theme) => setPreferenceTheme(theme), []);

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{
        theme,
        isDarkMode,
        setTheme,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}
