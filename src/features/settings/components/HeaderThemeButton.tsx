import { useTheme } from "@/hooks/use-theme";
import { MoonIcon, SunIcon } from "lucide-react";
import { ButtonProps } from "@/components/ui";
import { HeaderButton } from "@/components/HeaderButton";

export function ThemeButton(props: ButtonProps) {
  const theme = useTheme();

  return (
    <HeaderButton onClick={theme.toggleDarkMode} {...props}>
      {theme.isDarkMode ? <MoonIcon /> : <SunIcon />}
    </HeaderButton>
  );
}
