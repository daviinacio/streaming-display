import { Logo } from "@/assets/logo";
import { PluginListDialog } from "@/features/plugin/components/PluginListDialog";
import { ToggleFitVideoButton } from "@/features/preferences/components/HeadetFitButton";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, PaletteIcon, Plug2Icon } from "lucide-react";
import { HTMLAttributes } from "react";
import { HeaderButton } from "./HeaderButton";
import { ThemeButton } from "@/features/preferences/components/HeaderThemeButton";
import { ThemeDialog } from "@/features/preferences/components/ThemeDialog";
import { FullscreenButton } from "@/features/preferences/components/HeaderFullscreenButton";
import { Button, ButtonProps } from "./ui";

export type AppHeaderProps = HTMLAttributes<HTMLHeadElement>;

export function AppHeader({ className, ...props }: AppHeaderProps) {
  return (
    <header
      {...props}
      className={cn(
        "h-14 sm:h-16 bg-primary text-primary-foreground transition-colors",
        className,
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center",
          "gap-2 sm:gap-4 h-full",
          "pl-4 pr-2",
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderLink to="https://streaming-display-v1.onrender.com/">
              Open v1
              <ExternalLinkIcon className="w-4 h-4" />
            </HeaderLink>
            {/* <HeaderLink to="https://github.com/daviinacio/streaming-display">
              Github
              <ExternalLinkIcon className="w-4 h-4" />
            </HeaderLink> */}
          </div>
        </div>
        <div className="flex items-center sm:gap-1">
          <ToggleFitVideoButton title="Fit video" />

          {/* <SourceHandlerListDialog>
            <span>
              <HeaderButton title="Source handlers">
                <FileCogIcon />
              </HeaderButton>
            </span>
          </SourceHandlerListDialog> */}

          <PluginListDialog>
            <span>
              <HeaderButton title="Plugins">
                <Plug2Icon className="rotate-45" />
              </HeaderButton>
            </span>
          </PluginListDialog>

          <ThemeButton title="Theme" />

          <ThemeDialog>
            <span>
              <HeaderButton title="Customize">
                <PaletteIcon />
              </HeaderButton>
            </span>
          </ThemeDialog>
          <FullscreenButton title="Fullscreen" />
        </div>
      </div>
    </header>
  );
}

export function HeaderLink({
  children,
  className,
  to,
  ...props
}: ButtonProps & { to: string }) {
  return (
    <Button
      variant="link"
      className={cn("font-semibold text-primary-foreground p-0", className)}
      {...props}
    >
      <a
        className="flex items-center gap-1 text-xs"
        href={to}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    </Button>
  );
}
