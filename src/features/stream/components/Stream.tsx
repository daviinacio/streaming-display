import { Draggable } from "@/components/Draggable";
import { GridItemActions } from "@/features/grid/types/tmux-grid";
import { usePlugin } from "@/features/plugin";
import { PluginMount } from "@/features/plugin/components/PluginMount";
import { cn, mergeDefined } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { HtmlHTMLAttributes, useCallback, useEffect, useState } from "react";
import { StreamProvider } from "../hooks/use-stream";
import { Player } from "./Player";
import { PlayerHud } from "./PlayerHud";
import { StreamDragGhost } from "./StreamDragGhost";
import { StreamError } from "./StreamError";

function defaultSourceHandler({ src }: { src: string }) {
  return {
    sourceUrl: src,
  };
}

export interface StreamProps extends HtmlHTMLAttributes<HTMLDivElement> {
  url: string;
  grid: GridItemActions;
}

export function Stream({ url, className, grid, ...props }: StreamProps) {
  const { findComponentByUrl } = usePlugin();
  const pluginsSourceHandlers = findComponentByUrl(url, "source_handler");

  const [showPlayer, setShowPlayer] = useState(true);

  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ["handler", url, `${pluginsSourceHandlers.length}_handlers`],
    queryFn: () =>
      Promise.all(
        [defaultSourceHandler, ...pluginsSourceHandlers].map((fn) =>
          fn({ src: url }),
        ),
      ).then((r) =>
        r.reduce((acc, it) => {
          if (acc === undefined) return mergeDefined({}, it);
          return mergeDefined(acc, it);
        }, undefined),
      ),
    refetchOnMount: "always",
    // refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = useCallback(async () => {
    await refetch().then(() => {
      setShowPlayer(false);
    });
  }, [data, error, isFetching]);

  useEffect(() => setShowPlayer(true), [showPlayer]);

  return (
    <StreamProvider
      src={url}
      handler={data}
      grid={grid}
      error={error}
      refresh={handleRefresh}
    >
      <Draggable
        value={url}
        className="h-full w-full"
        ghost={<StreamDragGhost />}
      >
        <PlayerHud
          className={cn(
            "flex h-full w-full",
            "overflow-hidden bg-black rounded-xl",
            className,
          )}
          {...props}
        >
          <StreamError error={error} />

          {showPlayer && (
            <PluginMount
              position="player"
              key={url}
              fallback={<Player src={(data || {}).sourceUrl} />}
            />
          )}
        </PlayerHud>
      </Draggable>
    </StreamProvider>
  );
}
