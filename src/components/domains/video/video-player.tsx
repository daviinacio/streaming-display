import {
  Button,
  ButtonProps,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Slider,
} from "@/components/ui";
import { usePreference } from "@/hooks/use-preference";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { cn } from "@/lib/utils";
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  PauseIcon,
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons";
import { Slot } from "@radix-ui/react-slot";
import { useQuery } from "@tanstack/react-query";
import {
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

const inactivityTimeout = 2500;
const activityEvents = [
  "mousemove",
  "mouseenter",
  "mousedown",
  "mouseup",
] as const;

type VideoPlayerProps = GridItemProps;

export function VideoPlayer({ item, className, ...props }: VideoPlayerProps) {
  const sh = useSourceHandlers();
  const handler = useMemo(() => sh.findHandler(item.url), [sh, item.url]);
  const preferences = usePreference();

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
    playerPref[item.url] = state;
    preferences.setItem("player-preferences", playerPref);
  }, [state]);

  useEffect(() => {
    if (handler?.allow?.pip) return;
    dispatch({ type: "pip", value: false });
  }, [handler?.allow?.pip, state.pip]);

  useEffect(() => {
    if (handler?.allow?.fullscreen) return;
    dispatch({ type: "fullscreen", value: false });
  }, [handler?.allow?.fullscreen]);

  const { data, refetch } = useQuery({
    queryKey: ["handler", handler?.id, item.url],
    queryFn: () => handler && handler.resolver(item),
  });

  const handleError = useCallback(
    (err?: any) => {
      console.log(err);
      refetch();
    },
    [refetch]
  );

  useEffect(() => {
    if (!wrapperRef.current) return;
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
      for (let i = 1; i < 3; i++) {
        setTimeout(updateIframeHeight, Math.pow(100, i));
      }
    }

    updateIframeHeight();

    const observer = new MutationObserver(() => {
      updateIframeHeight();
    });

    if (wrapperRef.current.parentElement) {
      observer.observe(wrapperRef.current.parentElement, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }

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
  }, [fit, wrapperRef, state.playing]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    let timeout: NodeJS.Timeout | null = null;
    function activity(e: Event) {
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

  if (!data || !handler) return <p className="bg-cyan-500">Loading...</p>;
  if (!data.sourceUrl) return <p className="bg-cyan-500">Offline</p>;

  return (
    <GridItem
      item={item}
      className={cn(
        "p-1 transition-[opacity] duration-500 ease-in delay-300",
        state.fullscreen &&
          "[.grid:has(&)>div]:opacity-0 [.grid:has(&)>div]:delay-0 [.grid:has(&)>div]:ease-out !opacity-100",
        className
      )}
      isFullscreen={state.fullscreen}
      onDoubleClick={() => dispatch({ type: "toggle-fullscreen" })}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full ring-1 ring-input rounded-lg overflow-hidden",
          "bg-black text-white relative group/player z-[4] transition-all duration-300",
          !isInactive && "hover:ring-primary hover:ring-2",
          isInactive && "cursor-none"
        )}
        ref={wrapperRef}
      >
        <div
          key="player"
          className={cn(
            "h-full w-full pointer-events-none relative",
            state.pip && "hidden",
            fit && "[&_video]:object-cover",
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

        {handler.logo && (
          <img
            src={handler.logo}
            className="absolute top-4 right-4 bg-cover h-[32px] max-h-[10%] pointer-events-none"
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
          <div className="max-w-[50%] pointer-events-auto">
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
          <ActionButton>
            <XIcon />
          </ActionButton>
        </div>

        <div
          key="controls"
          className={cn(
            "absolute bottom-0 left-0 right-0",
            "flex items-center justify-between",
            "p-1 transition-[opacity] duration-300",
            "opacity-0",
            !isInactive && "group-hover/player:opacity-100",
            "bg-gradient-to-t from-black/80 pointer-events-auto"
          )}
        >
          <div className="flex items-center">
            <ActionButton onClick={() => dispatch({ type: "toggle-play" })}>
              {state.playing ? <PauseIcon /> : <PlayIcon />}
            </ActionButton>

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
          </div>
          <div>
            {handler.allow?.pip && (
              <ActionButton onClick={() => dispatch({ type: "toggle-pip" })}>
                {state.pip ? (
                  <PictureInPicture2Icon />
                ) : (
                  <PictureInPictureIcon />
                )}
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
      </div>
    </GridItem>
  );
}

export function ActionButton({
  className,
  children,
  onDoubleClick,
  ...props
}: ButtonProps) {
  return (
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
          "size-7",
          "group-hover/button:scale-125 group-active/button:scale-90",
          "transition-[transform] group-active/button:duration-75 duration-200"
        )}
      >
        {children}
      </Slot>
    </Button>
  );
}
