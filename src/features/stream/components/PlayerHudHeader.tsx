import { AddStreamToBucketDialog } from "@/features/bucket/components/AddStreamToBucketDialog";
import { PluginMount } from "@/features/plugin";
import { cn, copyToClipboard } from "@/lib/utils";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { FolderInputIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useStream } from "../hooks/use-stream";
import { PlayerHudAction } from "./PlayerHudAction";

export function PlayerHudHeader() {
  const { src, handler, grid, error } = useStream();
  const title = (handler ? handler.title : !error && "Loading...") || src;
  const [addToBucketOpen, setAddToBucketOpen] = useState(false);

  return (
    <div
      role="player-hud-header"
      className={cn(
        // "absolute top-0 left-0 right-0",
        "flex items-center justify-between pointer-events-auto",
        "p-1 pl-3 transition-all duration-300",
        "z-20 from-transparent to-transparent bg-gradient-to-b group-hover/player:from-black/80",
        " pointer-events-none",
      )}
    >
      <div className="max-w-[70%] pointer-events-auto flex gap-2 !text-white">
        {title && (
          <div className={cn("flex gap-1 max-w-full items-center")}>
            <p
              className={cn(
                "text-2xl font-semibold truncate translate-y-[-2px]",
                "drop-shadow-text",
              )}
              onClick={() => title && copyToClipboard(title, "Title")}
              data-visibility="default"
            >
              {title}
            </p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              data-visibility="default"
            >
              <PlayerHudAction size="sm">
                <ExternalLinkIcon />
              </PlayerHudAction>
            </a>
            <PluginMount position="header_left" />
          </div>
        )}
      </div>
      <div className="flex items-center">
        <PluginMount position="header_right" />
        <PlayerHudAction
          title="Add to bucket"
          onClick={() => setAddToBucketOpen(true)}
        >
          <FolderInputIcon />
        </PlayerHudAction>
        <PlayerHudAction onClick={() => grid.remove()}>
          <XIcon />
        </PlayerHudAction>
      </div>
      <AddStreamToBucketDialog
        open={addToBucketOpen}
        onOpenChange={setAddToBucketOpen}
        initialUrl={src}
      />
    </div>
  );
}
