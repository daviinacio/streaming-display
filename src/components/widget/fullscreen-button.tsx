import { ButtonProps } from "@/components/ui";
import { HeaderButton } from "@/components/widget";
import { useTemporaryState } from "@/hooks/use-temporary-state";
import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect } from "react";

export function FullscreenButton(props: ButtonProps) {
  const [isFullscreen, setIsFullscreen] = useTemporaryState(
    "fullscreen",
    !!document.fullscreenElement
  );

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    setTimeout(handler);

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((p) => !p);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  return (
    <HeaderButton onClick={toggleFullscreen} {...props}>
      {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
    </HeaderButton>
  );
}
