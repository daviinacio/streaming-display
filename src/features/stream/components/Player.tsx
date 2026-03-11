import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { useStream } from "../hooks/use-stream";

export interface PlayerProps {
  src: string;
}

export function Player({ src, ...props }: PlayerProps) {
  const { player, handler } = useStream();
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.shadowRoot) return;

    try {
      const video = playerRef.current.shadowRoot.querySelector("video");
      const iframe = playerRef.current.shadowRoot.querySelector("iframe");

      if (video) {
        video.style.height = "100%";
        video.style.width = "100%";
        video.style.objectFit = player.fit ? "cover" : "contain";
      } else if (iframe) {
        if (!player.fit) {
          iframe.style.minHeight = "";
          iframe.style.width = "";
          return;
        }

        function updateIframeHeight() {
          if (!playerRef.current || !iframe) return;

          iframe.style.minHeight = `${(playerRef.current.offsetWidth / 16) * 9}px`;

          iframe.style.width = `${Math.max(
            playerRef.current.offsetWidth,
            (playerRef.current.offsetHeight / 9) * 16,
          )}px`;
        }

        var resizeObserver = new ResizeObserver(() => {
          updateIframeHeight();
        });

        updateIframeHeight();

        resizeObserver.observe(playerRef.current);

        return () => {
          playerRef.current && resizeObserver.unobserve(playerRef.current);
        };
      }
    } catch (err) {
      console.error(
        "Fail to setup fit",
        err instanceof Error ? err.message : String(err),
      );
    }
  }, [player.fit, playerRef.current]);

  return (
    <>
      <ReactPlayer
        ref={playerRef}
        src={handler?.sourceUrl}
        {...player}
        {...props}
      />
    </>
  );
}
