import { Button, ButtonProps } from "@/components/ui";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { GridItemPosition } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  PauseIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { Slot } from "@radix-ui/react-slot";
import { useQuery } from "@tanstack/react-query";
import { PictureInPicture2Icon, PictureInPictureIcon } from "lucide-react";
import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import ReactPlayer from "react-player";
import FadeLoader from "react-spinners/FadeLoader";
import { GridItem } from "../grid/grid-item";
import { videoPlayerReducer } from "./video-player-reducer";
import { usePreference } from "@/hooks/use-preference";

type VideoPlayerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  item: GridItemPosition;
  grid: {
    width: number;
    height: number;
  };
};

export function VideoPlayer({
  item,
  grid,
  className,
  ...props
}: VideoPlayerProps) {
  const sh = useSourceHandlers();
  const handler = useMemo(() => sh.getById(item.sourceHandlerId), [sh]);
  const preferences = usePreference();

  const [state, dispatch] = useReducer(videoPlayerReducer, {});

  useEffect(() => {
    if (handler?.allow?.pip) return;
    dispatch({ type: "pip", value: false });
  }, [handler?.allow?.pip]);

  const { data, refetch } = useQuery({
    queryKey: ["video-player", item.url],
    queryFn: () => handler && handler.resolver(item),
  });

  const handleError = useCallback(
    (err?: any) => {
      console.log(err);
      refetch();
    },
    [refetch]
  );

  if (!data || !handler) return <p className="bg-cyan-500">Loading...</p>;
  if (!data.sourceUrl) return <p className="bg-cyan-500">Offline</p>;

  return (
    <GridItem
      item={item}
      grid={grid}
      className={className}
      isFullscreen={state.fullscreen}
      {...props}
    >
      <div
        key="player"
        className={cn(
          "h-full w-full pointer-events-none relative",
          state.pip && "hidden",
          preferences.getItem("maximize-video") && [
            "[&_video]:object-cover",
            "[&_iframe]:w-[200vw]",
          ],
          "[&_iframe]:absolute",
          "[&_iframe]:top-[50%]",
          "[&_iframe]:translate-x-[-50%]",
          "[&_iframe]:translate-y-[-50%]",
          "[&_iframe]:left-[50%]",
          "[&_iframe]:object-cover"
        )}
      >
        <div
          key="spinner"
          className="absolute inset-0 flex items-center justify-center"
        >
          <FadeLoader color="white" />
        </div>
        <ReactPlayer
          key="react-player"
          url={data.sourceUrl}
          playing={true}
          className={cn("h-full w-full pointer-events-none relative")}
          width="100%"
          height="100%"
          onStart={() => dispatch({ type: "play" })}
          onPause={() => dispatch({ type: "pause" })}
          onPlay={() => dispatch({ type: "play" })}
          onEnablePIP={() => dispatch({ type: "pip", value: true })}
          onDisablePIP={() => dispatch({ type: "pip", value: false })}
          onEnded={handleError}
          onError={handleError}
          controls={false}
          config={{
            youtube: {
              playerVars: { showinfo: 1 },
            },
          }}
          {...state}
        />
      </div>

      {state.pip && (
        <div
          key="pip"
          className={cn(
            "absolute inset-0 text-2xl text-muted-foreground",
            "flex flex-col items-center justify-center"
          )}
        >
          <PictureInPictureIcon className="size-16" />
          Picture-in-picture
        </div>
      )}

      <div
        key="header"
        className={cn(
          "absolute top-0 left-0 right-0",
          "flex items-center justify-between",
          "p-1 pl-3"
        )}
      >
        <p
          className={cn(
            "text-2xl font-semibold truncate",
            "drop-shadow-text",
            ""
          )}
        >
          {data.title}
        </p>
      </div>

      <div
        key="controls"
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "flex items-center justify-between",
          "p-1"
        )}
      >
        <div className="flex items-center">
          <ActionButton onClick={() => dispatch({ type: "toggle-play" })}>
            {state.playing ? <PauseIcon /> : <PlayIcon />}
          </ActionButton>
        </div>
        <div>
          {handler.allow?.pip && (
            <ActionButton onClick={() => dispatch({ type: "toggle-pip" })}>
              {state.pip ? <PictureInPicture2Icon /> : <PictureInPictureIcon />}
            </ActionButton>
          )}
          {handler.allow?.fullscreen && (
            <ActionButton
              onClick={() => dispatch({ type: "toggle-fullscreen" })}
            >
              {state.fullscreen ? (
                <ExitFullScreenIcon />
              ) : (
                <EnterFullScreenIcon />
              )}
            </ActionButton>
          )}
        </div>
      </div>
    </GridItem>
  );
}

export function ActionButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "p-2 rounded-full active:bg-black/5 md:hover:bg-black/5",
        "group active:text-white md:hover:text-white ",
        "transition-colors",
        className
      )}
      variant="ghost"
      {...props}
    >
      <Slot
        className={cn(
          "size-7",
          "group-hover:scale-125 group-active:scale-90",
          "transition-[transform] group-active:duration-75 duration-200"
        )}
      >
        {children}
      </Slot>
    </Button>
  );
}
