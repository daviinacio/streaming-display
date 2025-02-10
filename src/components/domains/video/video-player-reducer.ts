import { BaseReactPlayerProps } from "react-player/base";

type VideoPlayerState = Pick<
  BaseReactPlayerProps,
  "pip" | "playing" | "light" | "loop" | "playbackRate" | "volume" | "muted"
> & {
  maximize?: boolean;
  refetchInterval: number | false;
};

type VideoPlayerAction =
  | { type: "pip" | "maximize"; value: boolean }
  | { type: "progress" | "volume"; value: number }
  | {
      type:
        | "play"
        | "pause"
        | "toggle-play"
        | "toggle-mute"
        | "toggle-pip"
        | "toggle-maximize";
    }
  | { type: "refetch-interval"; value: number | false };

export function videoPlayerReducer(
  state: VideoPlayerState,
  action: VideoPlayerAction
): VideoPlayerState {
  switch (action.type) {
    case "play":
      return { ...state, playing: true };

    case "pause":
      return { ...state, playing: false };

    case "toggle-play":
      return { ...state, playing: !state.playing };

    case "toggle-mute":
      return { ...state, muted: !state.muted };

    case "toggle-pip":
      return { ...state, pip: !state.pip };

    case "toggle-maximize":
      return { ...state, maximize: !state.maximize };

    case "pip":
      return { ...state, pip: action.value };

    case "maximize":
      return { ...state, maximize: action.value };

    case "volume":
      return { ...state, volume: action.value };
    case "refetch-interval":
      return { ...state, refetchInterval: action.value };

    default:
      return state;
  }
}
