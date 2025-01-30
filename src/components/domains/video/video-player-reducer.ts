import { BaseReactPlayerProps } from "react-player/base";

type VideoPlayerState = Pick<
  BaseReactPlayerProps,
  "pip" | "playing" | "light" | "loop" | "playbackRate" | "volume" | "muted"
> & {
  fullscreen?: boolean;
};

type VideoPlayerAction =
  | { type: "pip" | "fullscreen"; value: boolean }
  | { type: "progress"; value: number }
  | {
      type:
        | "play"
        | "pause"
        | "toggle-play"
        | "toggle-mute"
        | "toggle-pip"
        | "toggle-fullscreen";
    }
  | { type: "volume"; value: number };

export function videoPlayerReducer(
  state: VideoPlayerState,
  action: VideoPlayerAction
) {
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

    case "toggle-fullscreen":
      return { ...state, fullscreen: !state.fullscreen };

    case "pip":
      return { ...state, pip: action.value };

    case "volume":
      return { ...state, volume: action.value };

    default:
      return state;
  }
}
