import { Logo } from "@/assets/logo";
import {
  FullscreenButton,
  HeaderButton,
  ThemeButton,
} from "@/components/widget";
import { cn } from "@/lib/utils";
import { ServerCogIcon } from "lucide-react";
import { HTMLAttributes } from "react";
import { SourceHandlerListDialog } from "../domains/source-handlers/source-handler-list-dialog";

export type AppHeaderProps = HTMLAttributes<HTMLHeadElement>;

export function AppHeader({ className, ...props }: AppHeaderProps) {
  return (
    <header
      {...props}
      className={cn(
        "h-14 sm:h-16 bg-green-700 transition-colors text-white",
        className
      )}
    >
      <div
        className={cn(
          "flex justify-between items-center",
          "gap-2 sm:gap-4 h-full container mx-auto",
          "pl-4 pr-2"
        )}
      >
        <div>
          <Logo />
        </div>
        <div className="flex items-center sm:gap-1">
          <SourceHandlerListDialog>
            <span>
              <HeaderButton>
                <ServerCogIcon />
              </HeaderButton>
            </span>
          </SourceHandlerListDialog>

          <ThemeButton />
          <FullscreenButton />
        </div>
      </div>
    </header>
  );
}
