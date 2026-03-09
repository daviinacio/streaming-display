import { GridItemActions } from "@/features/grid/types";
import { useLocalState } from "@daviapps/react-utils/hooks";
import { createContext, PropsWithChildren, useContext } from "react";
import { ReactPlayerProps } from "react-player/types";

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) throw new Error("Stream is required");
  return context;
}

export interface StreamContextState {
  src: string;
  handler?: any;
  grid: GridItemActions;
  player: ReactPlayerProps & {
    togglePlaying: () => void;
    play: () => void;
    pause: () => void;
    toggleMuted: () => void;
    setVolume: (volume: number) => void;
    togglePip: () => void;
  };
}

export const StreamContext = createContext<StreamContextState | null>(null);

export interface StreamProviderProps extends PropsWithChildren {
  src: string;
  handler?: any;
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

  const player: StreamContextState["player"] = {
    ...playerState,
    onPlay: () => setPlayerState((p) => ({ ...p, playing: true })),
    onPause: () => setPlayerState((p) => ({ ...p, playing: false })),
    onEnterPictureInPicture: () => setPlayerState((p) => ({ ...p, pip: true })),
    onLeavePictureInPicture: () =>
      setPlayerState((p) => ({ ...p, pip: false })),

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
