import { useCallback, useEffect } from "react";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { usePreference } from "@/features/preferences/hooks/use-preference";
import { ButtonProps } from "@/components/ui";
import { HeaderButton } from "@/components/HeaderButton";

export function ToggleFitVideoButton(props: ButtonProps) {
  const [fitVideo, setFitVideo] = usePreference("fit-video");

  const handleToggle = useCallback(() => setFitVideo((p) => !p), []);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        handleToggle();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleToggle]);
  return (
    <HeaderButton onClick={handleToggle} {...props}>
      {fitVideo ? <ShrinkIcon /> : <ExpandIcon />}
    </HeaderButton>
  );
}
