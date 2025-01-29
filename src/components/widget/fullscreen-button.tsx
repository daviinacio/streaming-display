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

  return (
    <HeaderButton onClick={toggleFullscreen} {...props}>
      {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
    </HeaderButton>
  );
}
