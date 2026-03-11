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
    // .catch((err) => {
    //   if (err instanceof Error) {
    //     return toast.error(err.message);
    //   } else toast.error(String(err));
    // }),
    refetchOnMount: "always",
    // refetchOnReconnect: "always",
    // refetchOnWindowFocus: "always",
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
          {error && (
            <div
              className={cn(
                "absolute inset-0 bg-black/70 flex flex-col gap-1 items-center justify-center",
                "[&_a]:underline [&_a]:text-base hover:[&_a]:text-destructive text-center",
              )}
            >
              {error?.message?.split("\n").map((m, i) =>
                i === 0 ? (
                  <h4
                    key={i}
                    className="text-2xl text-destructive font-bold mb-2"
                  >
                    {m}
                  </h4>
                ) : (
                  <span
                    key={i}
                    className="text-base leading-5"
                    dangerouslySetInnerHTML={{ __html: m }}
                  />
                ),
              )}
            </div>
          )}

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
