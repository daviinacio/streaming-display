import { usePlugin } from "@/features/plugin";
import { PluginMount } from "@/features/plugin/components/PluginMount";
import { cn, mergeDefined } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { HtmlHTMLAttributes } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { StreamProvider } from "../hooks/use-stream";
import { PlayerHud } from "./PlayerHud";
import { Draggable } from "@/components/domains/drag-n-drop/draggable";
import { StreamDragGhost } from "./StreamDragGhost";

export interface StreamProps extends HtmlHTMLAttributes<HTMLDivElement> {
  url: string;
}

export function Stream({ url, className, ...props }: StreamProps) {
  const { findComponentByUrl } = usePlugin();
  const pluginsSourceHandlers = findComponentByUrl(url, "source_handler");

  const { data } = useQuery({
    queryKey: ["handler", url],
    queryFn: () =>
      Promise.all(pluginsSourceHandlers.map((fn) => fn({ src: url })))
        .then((r) =>
          r.reduce((acc, it) => {
            return mergeDefined(acc, it);
          }, {}),
        )
        .catch((err) => {
          if (err instanceof Error) {
            return toast.error(err.message);
          } else toast.error(String(err));
        }),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <StreamProvider src={url} handler={data}>
      <Draggable
        type="url"
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
          <PluginMount
            position="player"
            key={url}
            fallback={<ReactPlayer src={(data || {}).sourceUrl} />}
          />
        </PlayerHud>
      </Draggable>
    </StreamProvider>
  );
}
