import { useCallback, useEffect } from "react";
import { ButtonProps } from "../ui";
import { HeaderButton } from "./header-button";
import { usePreference } from "@/hooks/use-preference";
import { ExpandIcon, ShrinkIcon } from "lucide-react";

export function ToggleFitVideoButton(props: ButtonProps) {
  const preferences = usePreference();

  const handleToggle = useCallback(
    () => preferences.setItem("fit-video", (p) => !p),
    []
  );

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
      {preferences.getItem("fit-video") ? <ShrinkIcon /> : <ExpandIcon />}
    </HeaderButton>
  );
}
