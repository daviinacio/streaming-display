import { GridItemActions } from "@/features/grid/types/tmux-grid";
import { usePreference } from "@/features/preferences/hooks/use-preference";
import { useUpdateEffect } from "@daviapps/react-utils/hooks/use-update-effect";
import { useLocalState } from "@daviapps/react-utils/hooks";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ReactPlayerProps } from "react-player/types";

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) throw new Error("Stream is required");
  return context;
}

export interface StreamContextState {
  src: string;
  handler?: any;
  error?: any;
  grid: GridItemActions;
  player: ReactPlayerProps & {
    togglePlaying: () => void;
    play: () => void;
    pause: () => void;
    toggleMuted: () => void;
    setVolume: (volume: number) => void;
    togglePip: () => void;

    buffering: boolean;

    fit: boolean;
    toggleFit: () => void;
  };
  refresh?: () => void;
}

export const StreamContext = createContext<StreamContextState | null>(null);

export interface StreamProviderProps extends PropsWithChildren {
  src: string;
  handler: any;
  error?: any;
  grid: GridItemActions;
  refresh: () => Promise<void>;
}

export function StreamProvider({
  children,
  refresh,
  ...props
}: StreamProviderProps) {
  const [preferenceFitVideo] = usePreference("fit-video");
  const [playerState, setPlayerState] = useLocalState({
    key: `player-state-${props.src}`,
    initialState: {
      muted: true,
      volume: 0.5,
      pip: false,
      fit: preferenceFitVideo,
    },
  });

  const [playerTempState, setPlayerTempState] = useState({
    playing: true,
    buffering: false,
  });

  const [lastPos, setLastPos] = useState(0);
  const [refreshCoolDown, setRefreshCoolDown] = useState(false);

  useUpdateEffect(() => {
    setPlayerState((p) => ({ ...p, fit: preferenceFitVideo }));
  }, [preferenceFitVideo]);

  useEffect(() => {
    setRefreshCoolDown(true);
    const timeout = setTimeout(() => setRefreshCoolDown(false), 2000);
    return () => clearTimeout(timeout);
  }, [refresh]);

  const player: StreamContextState["player"] = {
    ...playerState,
    ...playerTempState,
    onPlay: () => setPlayerState((p) => ({ ...p, playing: true })),
    onPause: () => setPlayerState((p) => ({ ...p, playing: false })),
    onEnterPictureInPicture: () => setPlayerState((p) => ({ ...p, pip: true })),
    onLeavePictureInPicture: () =>
      setPlayerState((p) => ({ ...p, pip: false })),

    onProgress: (state) => {
      // console.log("onProgress", state);
      if (
        playerTempState.playing &&
        state.timeStamp === lastPos &&
        state.timeStamp !== 0
      ) {
        setPlayerTempState((p) => ({ ...p, buffering: true }));
      } else {
        setPlayerTempState((p) => ({ ...p, buffering: false }));
      }
      setLastPos(state.timeStamp);
    },

    onEnded: () => {
      console.error(`Error on ${props.src}`);
      handleRefresh();
    },
    onError: () => handleRefresh(),

    // onWaiting: () => {
    //   setPlayerTempState((p) => ({ ...p, buffering: true }));
    //   console.log("onBuffer");
    // },
    // onPlaying: () => {
    //   setPlayerTempState((p) => ({ ...p, buffering: false }));
    //   console.log("onBufferEnd");
    // },

    // Custom actions
    togglePlaying() {
      setPlayerTempState((p) => ({ ...p, playing: !p.playing }));
    },
    play() {
      setPlayerTempState((p) => ({ ...p, playing: true }));
    },
    pause() {
      setPlayerTempState((p) => ({ ...p, playing: false }));
    },
    toggleMuted() {
      setPlayerState((p) => ({ ...p, muted: !p.muted }));
    },
    setVolume(volume) {
      setPlayerState((p) => ({ ...p, volume }));
    },
    togglePip() {
      setPlayerState((p) => ({ ...p, pip: !p.pip }));
    },
    toggleFit() {
      setPlayerState((p) => ({ ...p, fit: !p.fit }));
    },
  };

  const handleRefresh = useCallback(() => {
    refresh().then(() => {
      player.play();
    });
  }, [refresh]);

  return (
    <StreamContext.Provider
      value={{
        player,
        refresh: refreshCoolDown ? undefined : handleRefresh,
        ...props,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}
