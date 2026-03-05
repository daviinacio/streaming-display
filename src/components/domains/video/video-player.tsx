import {
  DropArea,
  DropLocation,
} from "@/components/domains/drag-n-drop/drop-area";
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
  Tv2Icon,
  XIcon,
} from "lucide-react";
import {
  Dispatch,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import FadeLoader from "react-spinners/FadeLoader";
import { Draggable } from "../drag-n-drop/draggable";
import { GridItem, GridItemProps } from "../grid/grid-item";
import {
  VideoPlayerAction,
  videoPlayerReducer,
  VideoPlayerState,
} from "./video-player-reducer";
import { ReactPlayerProps } from "react-player/types";

const runtimeState = ["maximize", "playing"] as const;

// const inactivityTimeout = 2500;
// const activityEvents = [
//   "mousemove",
//   "mouseenter",
//   "mousedown",
//   "mouseup",
// ] as const;

type VideoPlayerProps = Omit<GridItemProps, "onDrop"> & PlayerEvents;

export function VideoPlayer({
  item,
  grid,
  className,
  onDrop,
  onRemove,
  ...props
}: VideoPlayerProps) {
  const gridItemRef = useRef<HTMLDivElement>(null);
  const preferences = usePreference();

  const [state, dispatch] = useReducer(
    videoPlayerReducer,
    preferences.getItem("player-preferences")[item.url] || {
      refetchInterval: false,
      playing: true,
      muted: true,
      volume: 0.5,
    }
  );

  return (
    <GridItem
      item={item}
      grid={grid}
      className={cn(className)}
      isMaximized={state.maximize}
      ref={gridItemRef}
      {...props}
    >
      <Player
        url={item.url}
        onRemove={onRemove}
        playerCount={grid?.count}
        onDrop={onDrop}
        state={state}
        dispatch={dispatch}
      />
    </GridItem>
  );
}

export type PlayerProps = PlayerEvents & {
  url: string;
  playerCount?: number;
  state: VideoPlayerState;
  dispatch: Dispatch<VideoPlayerAction>;
};

export type PlayerEvents = {
  onDrop?: (
    content: string,
    location: DropLocation,
    url: string,
    moving?: boolean
  ) => void;
  onRemove?: (url: string) => void;
};

export const Player = memo(function ({
  url,
  onRemove,
  onDrop,
  playerCount,
  state,
  dispatch,
}: PlayerProps) {
  const playerRef = useRef<ReactPlayerProps>(null);
  const sh = useSourceHandlers();
  const handler = useMemo(() => sh.findHandler(url), [sh, url]);
  const preferences = usePreference();

  // const gridItemRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fit = preferences.getItem("fit-video");

  const [isInactive] = useState(false);

  useEffect(() => {
    const playerPref = preferences.getItem("player-preferences");
    playerPref[url] = exclude(state, ...runtimeState);
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

  useEffect(
    () =>
      console.debug(url, {
        refetchInterval:
          state.refetchInterval && millisecondsToString(state.refetchInterval),
      }),
    [state.refetchInterval]
  );

  const {
    data,
    error: fetchError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["handler", handler?.id, url],
    queryFn: () =>
      handler &&
      handler.resolver({
        url: url,
        minimize: () => console.log("TODO: Implement minimize", url),
        setRefetchInterval: (value) =>
          dispatch({ type: "refetch-interval", value }),
      }),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: state.refetchInterval,
    enabled: !!handler,
  });

  const [error, setError] = useState(fetchError);

  useEffect(() => {
    if (isFetching) return;
    setError(fetchError);
  }, [isFetching, fetchError, data]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const iframe = wrapperRef.current.querySelector("iframe");
    if (!iframe) return;

    if (!fit) {
      iframe.style.minHeight = "";
      iframe.style.width = "";
      return;
    }

    function updateIframeHeight() {
      if (!wrapperRef.current || !iframe) return;

      iframe.style.minHeight = `${(wrapperRef.current.offsetWidth / 16) * 9}px`;

      iframe.style.width = `${Math.max(
        wrapperRef.current.offsetWidth,
        (wrapperRef.current.offsetHeight / 9) * 16
      )}px`;
    }

    var resizeObserver = new ResizeObserver(() => {
      updateIframeHeight();
    });

    updateIframeHeight();

    resizeObserver.observe(wrapperRef.current);

    return () => {
      wrapperRef.current && resizeObserver.unobserve(wrapperRef.current);
    };
  }, [wrapperRef.current, state.maximize, state.playing, fit]);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (!state.maximize) return;
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "maximize", value: false });
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  const [forcedRefresh, setForcedRefresh] = useState(false);
  useEffect(() => setForcedRefresh(false), [forcedRefresh]);

  const [refreshCoolDown, setRefreshCoolDown] = useState(false);
  useEffect(() => {
    setRefreshCoolDown(true);
    const timeout = setTimeout(() => setRefreshCoolDown(false), 2000);
    return () => clearTimeout(timeout);
  }, [data, error, isFetching]);

  const handleRefresh = useCallback(
    async (...err: any[]) => {
      if (refreshCoolDown) return;
      if (err[0] === "force") {
        setForcedRefresh(true);
        await refetch();
      } else if (err[0] === "hlsError") {
        console.debug("Refetching", url, err.join(", "));
        await refetch();

        // Second refresh
        setTimeout(() => refetch(), 20 * 1000);
      } else {
        console.debug("Playing", url, err.join(", "));
      }

      dispatch({ type: "play" });
    },
    [refetch, refreshCoolDown]
  );

  useEffect(() => {
    error && dispatch({ type: "maximize", value: false });
  }, [error]);

  useEffect(() => {
    console.log(playerRef);
  }, [playerRef]);

  const allowMaximize =
    handler?.allow?.maximize && !error && playerCount && playerCount > 1;

  return (
    <Draggable
      type="url"
      value={url}
      onDoubleClick={() =>
        allowMaximize && dispatch({ type: "toggle-maximize" })
      }
      className={cn(
        "h-full",
        "duration-500 ease-in delay-100",
        state.maximize &&
          "[[role=grid]:has(&)_[role=grid-item]>div]:opacity-0 [[role=grid]:has(&)_[role=grid-item]>div]:delay-0 [[role=grid]:has(&)_[role=grid-item]>div]:ease-out !opacity-100"
      )}
      disabled={state.maximize}
      ghost={
        <div
          className={cn(
            "border-2 px-2 h-[40px] bg-black/70 rounded-md flex items-center gap-2",
            error ? "border-destructive" : "border-primary"
          )}
        >
          <div>
            <Tv2Icon
              className={cn(
                "size-5",
                error ? "text-destructive" : "text-primary"
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-white text-lg font-semibold truncate max-w-[400px]",
                "drop-shadow-text"
              )}
            >
              {data?.title || url}
            </p>
            {handler && handler.logo && (
              <img
                src={handler.logo}
                className="bg-cover h-[20px] min-h-[10px] pointer-events-none"
              />
            )}
          </div>
        </div>
      }
    >
      <DropArea
        onDragOver={() => dispatch({ type: "maximize", value: false })}
        value={url}
        className={cn("pointer-events-auto overflow-hidden p-0")}
        onDrop={(_url, location, moving) => {
          onDrop && onDrop(_url, location, url, moving);
        }}
        disabled={state.maximize}
      >
        <div
          className={cn(
            "h-full w-full",
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
              <div
                className={cn(
                  "absolute top-1 left-1  z-20 transition-[opacity] duration-300",
                  "  flex flex-col gap-2",
                  !isInactive && "group-hover/player:opacity-0"
                )}
              >
                {data && data.sourceUrl && !error && (
                  <>
                    {!state.muted && state.playing && (
                      <SpeakerLoudIcon className="size-8 bg-primary p-1.5 text-white rounded-full" />
                    )}

                    {!state.playing && (
                      <PauseIcon className="size-8 bg-primary p-1 text-white rounded-full" />
                    )}
                  </>
                )}
              </div>
              {data && data.sourceUrl && !forcedRefresh && (
                <div
                  key="player"
                  className={cn(
                    "h-full w-full pointer-events-all",
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
                  {/* <div
                    key="spinner"
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      error && "hidden"
                    )}
                  >
                    <FadeLoader color="white" />
                  </div> */}
                  <ReactPlayer
                    key="react-player"
                    src={data.sourceUrl}
                    // playing={true}
                    className={cn("h-full w-full pointer-events-all relative")}
                    // stopOnUnmount={false}
                    width="100%"
                    height="100%"
                    onStart={() => dispatch({ type: "play" })}
                    onPause={() => dispatch({ type: "pause" })}
                    onPlay={() => dispatch({ type: "play" })}
                    // onEnablePIP={() => dispatch({ type: "pip", value: true })}
                    // onDisablePIP={() => dispatch({ type: "pip", value: false })}
                    onEnded={(...args) => handleRefresh(...args)}
                    onError={(...args) => handleRefresh(...args)}
                    // onBufferEnd={(...args) => handleRefresh(...args)}
                    controls={false}
                    config={{
                      youtube: {
                        // playerVars: { showinfo: 1 },
                      },
                    }}
                    // ref={playerRef}
                    {...exclude(state, "refetchInterval", "maximize")}
                    volume={state.muted ? 0 : state.volume}
                    muted={false}
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
                    )
                  )}
                </div>
              )}

              {!data && !error && isFetching && (
                <div className="flex h-full items-center gap-2 justify-center text-xl font-bold">
                  {/* <LoaderCircleIcon className="size-6 animate-spin" /> */}
                  <p className="animate-pulse">Fetching metadata</p>
                  <div className="flex">
                    <p className="animate-pulse duration-1000">.</p>
                    <p className="animate-pulse duration-1000 delay-300">.</p>
                    <p className="animate-pulse duration-1000 delay-700">.</p>
                  </div>
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
                      <a href={url} target="_blank" rel="noreferrer">
                        <ActionButton size="sm">
                          <ExternalLinkIcon />
                        </ActionButton>
                      </a>
                    </div>
                  )}
                </div>
                {!state.maximize && (
                  <ActionButton onClick={() => onRemove && onRemove(url)}>
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
                <ScrollArea
                  orientation="horizontal"
                  className="max-w-[50%]"
                  scrollBarClassName="hidden"
                >
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
                              ) : state.volume >= 0.2 && state.volume < 0.8 ? (
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
                  scrollBarClassName="hidden"
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
                        disabled={refreshCoolDown || isFetching}
                      >
                        <ReloadIcon />
                      </ActionButton>
                    )}

                    {handler.allow?.pip && !error && data && (
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
                    {allowMaximize && data && (
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
    </Draggable>
  );
});

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
