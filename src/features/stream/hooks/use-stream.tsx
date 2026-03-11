import { GridItemActions } from "@/features/grid/types/tmux-grid";
import { useLocalState } from "@daviapps/react-utils/hooks";
import {
  createContext,
  PropsWithChildren,
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
  };
}

export const StreamContext = createContext<StreamContextState | null>(null);

export interface StreamProviderProps extends PropsWithChildren {
  src: string;
  handler?: any;
  error?: any;
  grid: GridItemActions;
}

export function StreamProvider({ children, ...props }: StreamProviderProps) {
  const [playerState, setPlayerState] = useLocalState({
    key: `player-state-${props.src}`,
    initialState: {
      playing: true,
      muted: true,
      volume: 0.5,
      pip: false,
    },
  });

  const [playerTempState, setPlayerTempState] = useState({
    buffering: false,
  });

  const [lastPos, setLastPos] = useState(0);

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasStarted(true);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [playerState.playing]);

  const player: StreamContextState["player"] = {
    ...playerState,
    ...playerTempState,
    playing: hasStarted ? playerState.playing : false,
    onPlay: () => setPlayerState((p) => ({ ...p, playing: true })),
    onPause: () => setPlayerState((p) => ({ ...p, playing: false })),
    onEnterPictureInPicture: () => setPlayerState((p) => ({ ...p, pip: true })),
    onLeavePictureInPicture: () =>
      setPlayerState((p) => ({ ...p, pip: false })),

    onProgress: (state) => {
      console.log("onProgress", state);
      if (
        playerState.playing &&
        state.timeStamp === lastPos &&
        state.timeStamp !== 0
      ) {
        setPlayerTempState((p) => ({ ...p, buffering: true }));
      } else {
        setPlayerTempState((p) => ({ ...p, buffering: false }));
      }
      setLastPos(state.timeStamp);
    },

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
      setPlayerState((p) => ({ ...p, playing: !p.playing }));
    },
    play() {
      setPlayerState((p) => ({ ...p, playing: true }));
    },
    pause() {
      setPlayerState((p) => ({ ...p, playing: false }));
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
  };

  return (
    <StreamContext.Provider
      value={{
        player,
        ...props,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}
