import { deserializeLocalState } from "@daviapps/react-utils/hooks";
import Color from "color";

export type ApplyThemeProps = {
  colorPrimary?: string;
  isDarkMode?: boolean;
};

export function applyTheme(props?: ApplyThemeProps) {
  const root = window.document.documentElement;
  let { colorPrimary: colorPrimaryHsl, isDarkMode } = props || {};
  const preferences = deserializeLocalState();

  // Theme colors
  colorPrimaryHsl =
    colorPrimaryHsl ?? preferences["color-primary"] ?? "142 72% 42%";
  const colorPrimary = Color(`hsl(${colorPrimaryHsl})`);
  root.style.setProperty("--primary", colorPrimaryHsl || "");
  const colorPrimaryDark = colorPrimary.darken(0.1).hsl().string();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", colorPrimaryDark);
  root.style.setProperty(
    "--primary-foreground",
    colorPrimary.darken(0.2).isDark() ? "0 0% 98%" : "240 5.9% 10%",
  );

  // Theme schema
  isDarkMode =
    isDarkMode ??
    (function () {
      const isBrowserDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return (isDarkMode =
        preferences.theme === "dark" ||
        (preferences.theme === "system" && isBrowserDarkMode));
    })();
  root.classList.remove("light", "dark");
  root.classList.add(isDarkMode ? "dark" : "light");
}
