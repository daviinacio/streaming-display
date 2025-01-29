import { Logo } from "@/assets/logo";
import {
  FullscreenButton,
  HeaderButton,
  ThemeButton,
} from "@/components/widget";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, FileCogIcon } from "lucide-react";
import { HTMLAttributes } from "react";
import { SourceHandlerListDialog } from "../domains/source-handlers/source-handler-list-dialog";
import { Button } from "../ui";

export type AppHeaderProps = HTMLAttributes<HTMLHeadElement>;

export function AppHeader({ className, ...props }: AppHeaderProps) {
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
          "gap-2 sm:gap-4 h-full container mx-auto",
          "pl-4 pr-2"
        )}
      >
        <div className="flex items-center gap-4">
          <Logo />

          <div className="hidden md:flex items-center gap-2">
            <Button variant="link" className="font-semibold text-white">
              <a
                className="flex items-center gap-1"
                href="https://streaming-display-v1.onrender.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open v1
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="flex items-center sm:gap-1">
          <SourceHandlerListDialog>
            <span>
              <HeaderButton>
                <FileCogIcon />
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
