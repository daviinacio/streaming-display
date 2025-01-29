import { useTheme } from "@/hooks/use-theme";
import { MoonIcon, SunIcon } from "lucide-react";
import { HeaderButton } from "@/components/widget";
import { ButtonProps } from "@/components/ui";

export function ThemeButton(props: ButtonProps) {
  const theme = useTheme();

  return (
    <HeaderButton onClick={theme.toggleDarkMode} {...props}>
      {theme.isDarkMode ? <MoonIcon /> : <SunIcon />}
    </HeaderButton>
  );
}
