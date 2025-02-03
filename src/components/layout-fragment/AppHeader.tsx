import { Logo } from "@/assets/logo";
import {
  FullscreenButton,
  HeaderButton,
  ThemeButton,
} from "@/components/widget";
import { cn } from "@/lib/utils";
import {
  ExpandIcon,
  ExternalLinkIcon,
  FileCogIcon,
  ShrinkIcon,
} from "lucide-react";
import { HTMLAttributes } from "react";
import { SourceHandlerListDialog } from "../domains/source-handlers/source-handler-list-dialog";
import { Button, ButtonProps } from "../ui";
import { usePreference } from "@/hooks/use-preference";

export type AppHeaderProps = HTMLAttributes<HTMLHeadElement>;

export function AppHeader({ className, ...props }: AppHeaderProps) {
  const preferences = usePreference();
  return (
    <header
      {...props}
      className={cn(
        "h-14 sm:h-16 bg-primary text-white transition-colors",
        className
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center",
          "gap-2 sm:gap-4 h-full",
          "pl-4 pr-2"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderLink to="https://streaming-display-v1.onrender.com/">
              Open v1
              <ExternalLinkIcon className="w-4 h-4" />
            </HeaderLink>
            <HeaderLink to="https://github.com/daviinacio/streaming-display">
              Github
              <ExternalLinkIcon className="w-4 h-4" />
            </HeaderLink>
          </div>
        </div>
        <div className="flex items-center sm:gap-1">
          <HeaderButton
            title="Fit video"
            onClick={() => {
              preferences.setItem(
                "fit-video",
                !preferences.getItem("fit-video")
              );
            }}
          >
            {preferences.getItem("fit-video") ? <ShrinkIcon /> : <ExpandIcon />}
          </HeaderButton>

          <SourceHandlerListDialog>
            <span>
              <HeaderButton title="Source handlers">
                <FileCogIcon />
              </HeaderButton>
            </span>
          </SourceHandlerListDialog>

          <ThemeButton title="Theme" />
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
      className={cn("font-semibold text-white p-0", className)}
      {...props}
    >
      <a
        className="flex items-center gap-1 text-xs sm:text-base"
        href={to}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    </Button>
  );
}
