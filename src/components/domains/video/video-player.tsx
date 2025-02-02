import { DropArea, DropLocation } from "@/components/drag-n-drop/drop-area";
import {
  Button,
  ButtonProps,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ScrollArea,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { usePreference } from "@/hooks/use-preference";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import {
  cn,
  copyToClipboard,
  exclude,
  millisecondsToString,
} from "@/lib/utils";
import {
  ClipboardCopyIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons";
import { Slot } from "@radix-ui/react-slot";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  XIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import FadeLoader from "react-spinners/FadeLoader";
import { GridItem, GridItemProps } from "../grid/grid-item";
import { videoPlayerReducer } from "./video-player-reducer";

const runtimeState = ["maximize", "playing"] as const;

const inactivityTimeout = 2500;
const activityEvents = [
  "mousemove",
  "mouseenter",
  "mousedown",
  "mouseup",
] as const;

type VideoPlayerProps = Omit<GridItemProps, "onDrop"> & {
  onDrop?: (content: string, location: DropLocation, url: string) => void;
  onRemove?: (url: string) => void;
};

export function VideoPlayer({
  item,
  grid,
  className,
  onDrop,
  onRemove,
  ...props
}: VideoPlayerProps) {
  const sh = useSourceHandlers();
  const handler = useMemo(() => sh.findHandler(item.url), [sh, item.url]);
  const preferences = usePreference();

  const gridItemRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fit = preferences.getItem("fit-video");

  const [isInactive, setIsInactive] = useState(true);

  const [state, dispatch] = useReducer(
    videoPlayerReducer,
    preferences.getItem("player-preferences")[item.url] || {
      playing: true,
      muted: true,
      volume: 0.5,
    }
  );

  useEffect(() => {
    const playerPref = preferences.getItem("player-preferences");
    playerPref[item.url] = exclude(state, ...runtimeState);
    preferences.setItem("player-preferences", playerPref);
  }, [state]);

  useEffect(() => {
    if (handler?.allow?.pip) return;
    dispatch({ type: "pip", value: false });
  }, [handler?.allow?.pip, state.pip]);

  useEffect(() => {
    if (handler?.allow?.maximize) return;
    dispatch({ type: "maximize", value: false });
  }, [handler?.allow?.maximize]);

  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);

  useEffect(
    () =>
      console.log(item.url, {
        refetchInterval:
          refetchInterval && millisecondsToString(refetchInterval),
      }),
    [refetchInterval]
  );

  const { data, error, refetch, isFetching, failureCount } = useQuery({
    queryKey: ["handler", handler?.id, item.url],
    queryFn: () =>
      handler &&
      handler.resolver({
        url: item.url,
        minimize: () => console.log("TODO: Implement minimize", item.url),
        setRefetchInterval,
      }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    refetchInterval: refetchInterval,
    // retryDelay: 2 * 1000,
  });

  useEffect(() => {
    if (!wrapperRef.current || !gridItemRef.current) return;
    const iframe = wrapperRef.current.querySelector("iframe");
    if (!iframe) return;

    function updateIframeHeight() {
      if (!wrapperRef.current || !iframe) return;
      iframe.style.minHeight = fit
        ? `${(wrapperRef.current.offsetWidth / 16) * 9}px`
        : "";

      iframe.style.width = fit
        ? `${Math.max(
            wrapperRef.current.offsetWidth,
            (wrapperRef.current.offsetHeight / 9) * 16
          )}px`
        : "";
    }

    function delayedUpdateIframeHeight() {
      for (let i = 1; i < 20; i++) {
        setTimeout(() => fit && updateIframeHeight(), 20 * i);
      }
    }

    updateIframeHeight();
    delayedUpdateIframeHeight();

    const observer = new MutationObserver(() => {
      updateIframeHeight();
    });

    observer.observe(gridItemRef.current, {
      attributes: true,
      attributeFilter: ["style"],
    });

    document.documentElement.addEventListener(
      "fullscreenchange",
      delayedUpdateIframeHeight
    );
    window.addEventListener("resize", updateIframeHeight);
    return () => {
      if (!window) return;
      window.removeEventListener("resize", updateIframeHeight);
      document.documentElement.removeEventListener(
        "fullscreenchange",
        delayedUpdateIframeHeight
      );
      observer.disconnect();
    };
  }, [
    fit,
    wrapperRef,
    gridItemRef.current,
    state.playing,
    state.maximize,
    grid?.count,
  ]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    let timeout: NodeJS.Timeout | null = null;
    function activity(e: Event) {
      // console.log(e);
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      setIsInactive(false);
      if (e.target !== wrapperRef.current) return;

      timeout = setTimeout(() => {
        setIsInactive(() => true);
      }, inactivityTimeout);
    }

    activityEvents.forEach((ac) => document.addEventListener(ac, activity));
    return () => {
      activityEvents.forEach((ac) =>
        document.removeEventListener(ac, activity)
      );
    };
  }, [wrapperRef.current]);

  const handleRefresh = useCallback(
    async (err?: any, err2?: any) => {
      if (err === "force" || err === "hlsError") {
        console.log("Refetching", err, err2, item.url);
        await refetch();
      } else {
        console.log("Playing", err, err2, item.url);
      }

      dispatch({ type: "play" });
    },
    [refetch, failureCount]
  );

  useEffect(() => {
    error && dispatch({ type: "maximize", value: false });
  }, [error]);

  const allowMaximize =
    handler?.allow?.maximize && !error && grid?.count && grid.count > 1;

  return (
    <GridItem
      item={item}
      grid={grid}
      className={cn(className)}
      isMaximized={state.maximize}
      onDoubleClick={() =>
        allowMaximize && dispatch({ type: "toggle-maximize" })
      }
      ref={gridItemRef}
      {...props}
    >
      <div
        className={cn(
          "h-full",
          "duration-500 ease-in delay-100",
          state.maximize &&
            "[[role=grid]:has(&)_[role=grid-item]>div]:opacity-0 [[role=grid]:has(&)_[role=grid-item]>div]:delay-0 [[role=grid]:has(&)_[role=grid-item]>div]:ease-out !opacity-100"
        )}
      >
        <DropArea
          className={cn("pointer-events-auto  overflow-hidden p-0")}
          onDrop={(url, location) => onDrop && onDrop(url, location, item.url)}
          disabled={state.maximize}
        >
          <div
            className={cn(
              "h-full w-full ",
              "bg-black text-white relative group/player z-[4] rounded-lg overflow-hidden",
              "ring-1 ring-input transition-all duration-300",
              !isInactive && [
                "hover:ring-2",
                error ? "hover:ring-destructive" : "hover:ring-primary",
              ],
              isInactive && "cursor-none"
            )}
            ref={wrapperRef}
          >
            {handler && (
              <>
                {data && data.sourceUrl && !error && !state.muted && (
                  <div className="absolute top-2 left-2 z-20 group-hover/player:opacity-0 transition-[opacity] duration-300">
                    <SpeakerLoudIcon className="size-6" />
                  </div>
                )}
                {data && data.sourceUrl && (
                  <div
                    key="player"
                    className={cn(
                      "h-full w-full pointer-events-none",
                      state.pip && "hidden",
                      fit && "[&_video]:object-cover",
                      "[&_iframe]:absolute",
                      "[&_iframe]:top-[50%]",
                      "[&_iframe]:translate-x-[-50%]",
                      "[&_iframe]:translate-y-[-50%]",
                      "[&_iframe]:left-[50%]",
                      "[&_iframe]:object-cover",
                      "text-white",
                      error && "blur-sm"
                    )}
                  >
                    <div
                      key="spinner"
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        error && "hidden"
                      )}
                    >
                      <FadeLoader color="white" />
                    </div>
                    <ReactPlayer
                      key="react-player"
                      url={data.sourceUrl}
                      playing={true}
                      className={cn(
                        "h-full w-full pointer-events-none relative"
                      )}
                      width="100%"
                      height="100%"
                      onStart={() => dispatch({ type: "play" })}
                      onPause={() => dispatch({ type: "pause" })}
                      onPlay={() => dispatch({ type: "play" })}
                      onEnablePIP={() => dispatch({ type: "pip", value: true })}
                      onDisablePIP={() =>
                        dispatch({ type: "pip", value: false })
                      }
                      onEnded={handleRefresh}
                      onError={handleRefresh}
                      onBufferEnd={handleRefresh}
                      controls={false}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 },
                        },
                      }}
                      {...state}
                    />
                  </div>
                )}

                {error && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/70 flex flex-col gap-1 items-center justify-center",
                      "[&_a]:underline [&_a]:text-base hover:[&_a]:text-destructive text-center"
                    )}
                  >
                    {error.message.split("\n").map((m, i) =>
                      i === 0 ? (
                        <h4
                          key={i}
                          className="text-4xl text-destructive font-bold mb-2"
                        >
                          {m}
                        </h4>
                      ) : (
                        <span
                          key={i}
                          className="text-base leading-5"
                          dangerouslySetInnerHTML={{ __html: m }}
                        />
                      )
                    )}
                  </div>
                )}

                {handler.logo && (
                  <img
                    src={handler.logo}
                    className="absolute top-4 right-4 bg-cover h-[32px] min-h-[10px] max-h-[10%] pointer-events-none"
                  />
                )}

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
                    "p-1 pl-3 transition-[opacity] duration-300",
                    "opacity-0",
                    !isInactive && "group-hover/player:opacity-100",
                    "bg-gradient-to-b from-black/80 pointer-events-none"
                  )}
                >
                  <div className="max-w-[70%] pointer-events-auto flex gap-2">
                    {data?.title && (
                      <div className="flex gap-1 max-w-full">
                        <p
                          className={cn(
                            "text-2xl font-semibold truncate",
                            "drop-shadow-text"
                          )}
                          onClick={() =>
                            data?.title && copyToClipboard(data?.title, "Title")
                          }
                        >
                          {data?.title}
                        </p>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          <ActionButton size="sm">
                            <ExternalLinkIcon />
                          </ActionButton>
                        </a>
                      </div>
                    )}
                  </div>
                  {!state.maximize && (
                    <ActionButton
                      onClick={() => onRemove && onRemove(item.url)}
                    >
                      <XIcon />
                    </ActionButton>
                  )}
                </div>

                <div
                  key="controls"
                  className={cn(
                    "absolute bottom-0 left-0 right-0",
                    "flex items-center justify-between",
                    "p-1 transition-[opacity] duration-300",
                    "opacity-0",
                    !isInactive && "group-hover/player:opacity-100",
                    "bg-gradient-to-t from-black/80 "
                    // "!pointer-events-none",
                    // (error || !data) && "hidden"
                  )}
                >
                  <ScrollArea orientation="horizontal" className="max-w-[50%]">
                    <div
                      className={cn(
                        "flex items-center",
                        (error || !data) && "hidden"
                      )}
                    >
                      <ActionButton
                        onClick={() => dispatch({ type: "toggle-play" })}
                      >
                        {state.playing ? <PauseIcon /> : <PlayIcon />}
                      </ActionButton>

                      {handler.allow?.volume && (
                        <HoverCard open={state.muted ? false : undefined}>
                          <HoverCardTrigger>
                            <ActionButton
                              className="relative top-0 z-[10]"
                              onClick={() => dispatch({ type: "toggle-mute" })}
                            >
                              {state.muted ? (
                                <SpeakerOffIcon />
                              ) : typeof state.volume !== "undefined" ? (
                                state.volume < 0.2 ? (
                                  <SpeakerQuietIcon />
                                ) : state.volume >= 0.2 &&
                                  state.volume < 0.8 ? (
                                  <SpeakerModerateIcon />
                                ) : (
                                  <SpeakerLoudIcon />
                                )
                              ) : undefined}
                            </ActionButton>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-40 p-4 z-[0] pl-12 rounded-full bg-background/50 flex items-end pointer-events-auto"
                            side="right"
                            align="start"
                            alignOffset={-2}
                            sideOffset={-46}
                            onDoubleClick={(e) => e.stopPropagation()}
                          >
                            <Slider
                              defaultValue={[0.8]}
                              max={1}
                              step={0.05}
                              value={[state.volume || 0]}
                              orientation="horizontal"
                              onValueChange={(value) =>
                                dispatch({ type: "volume", value: value[0] })
                              }
                            />
                          </HoverCardContent>
                        </HoverCard>
                      )}
                    </div>
                  </ScrollArea>
                  <ScrollArea
                    orientation="horizontal"
                    // fit
                    className="max-w-[50%]"
                  >
                    <div className="flex items-center justify-end">
                      {handler.allow?.copySourceUrl && data?.sourceUrl && (
                        <ActionButton
                          title="Copy source url"
                          onClick={() =>
                            copyToClipboard(data.sourceUrl, "Source URL")
                          }
                        >
                          <ClipboardCopyIcon />
                        </ActionButton>
                      )}
                      {handler.allow?.refresh && (
                        <ActionButton
                          title="Refresh link"
                          className={cn(isFetching && "animate-spin")}
                          onClick={() => handleRefresh("force", null)}
                        >
                          <ReloadIcon />
                        </ActionButton>
                      )}

                      {handler.allow?.pip && !error && (
                        <ActionButton
                          title="Picture-in-picture"
                          onClick={() => dispatch({ type: "toggle-pip" })}
                        >
                          {state.pip ? (
                            <PictureInPicture2Icon />
                          ) : (
                            <PictureInPictureIcon />
                          )}
                        </ActionButton>
                      )}
                      {allowMaximize && (
                        <ActionButton
                          title="Maximize"
                          onClick={() => dispatch({ type: "toggle-maximize" })}
                        >
                          {state.maximize ? (
                            <ExitFullScreenIcon />
                          ) : (
                            <EnterFullScreenIcon />
                          )}
                        </ActionButton>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        </DropArea>
      </div>
    </GridItem>
  );
}

export function ActionButton({
  className,
  children,
  onDoubleClick,
  size,
  title,
  ...props
}: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "p-2 rounded-full active:bg-black/5 md:hover:bg-black/5",
              "active:text-white md:hover:text-white ",
              "transition-colors group/button pointer-events-auto",
              className
            )}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onDoubleClick && onDoubleClick(e);
            }}
            variant="ghost"
            {...props}
          >
            <Slot
              className={cn(
                size === "sm" ? "size-5" : "size-7",
                "group-hover/button:scale-125 group-active/button:scale-90",
                "transition-[transform] group-active/button:duration-75 duration-200"
              )}
            >
              {children}
            </Slot>
          </Button>
        </TooltipTrigger>
        {title && (
          <TooltipContent className="text-white font-semibold shadow-sm shadow-black">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
