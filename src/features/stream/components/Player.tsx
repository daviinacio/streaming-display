import ReactPlayer from "react-player";
import { useStream } from "../hooks/use-stream";

export interface PlayerProps {
  src: string;
}

export function Player({ src, ...props }: PlayerProps) {
  const { player, handler } = useStream();
  return (
    <ReactPlayer
      src={handler?.sourceUrl}
      width="100%"
      height="100%"
      {...props}
      {...player}
    />
  );
}
