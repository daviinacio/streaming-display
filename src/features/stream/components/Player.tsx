import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export interface PlayerProps {
  src: string;
  playing: boolean;
}

export function Player({ src, playing = true, ...props }: PlayerProps) {
  // const [hasStarted, setHasStarted] = useState(false);
  // const [playing, setPlaying] = useState(false);

  // // useEffect(() => {
  // //   setPlaying(false);
  // //   const timeout = setTimeout(() => {
  // //     setPlaying(true);
  // //     setTimeout(() => setPlaying(false));
  // //     setTimeout(() => setPlaying(true), 100);
  // //   }, 1000);
  // //   return () => clearTimeout(timeout);
  // // }, []);

  return (
    <ReactPlayer
      src={src}
      playing={playing}
      muted={true}
      controls={false}
      width="100%"
      height="100%"
      // onPlaying={() => setHasStarted(true)}
      {...props}
      // style={{ zIndex: hasStarted ? 1 : 9999999 }}
    />
  );
}
