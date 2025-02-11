import { ButtonProps } from "@/components/ui";
import { EnterFullScreenIcon, ExitFullScreenIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { HeaderButton } from "@/components/widget";

export function FullscreenButton(props: ButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

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
