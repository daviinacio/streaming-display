import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "../ui";
import { KeyboardEventHandler, useCallback } from "react";

const tabulationText = "  ";

export function CodeEditor({ rows, className, ...props }: TextareaProps) {
  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    (e) => {
      const value = e.currentTarget.value;
      const currentLine =
        value
          .substring(0, e.currentTarget.selectionStart)
          .split("\n")
          .slice(-1)[0] || "";
      const currentTabulation = (currentLine.match(/^ */) || [])[0];

      if (e.key === "Tab") {
        e.preventDefault();
        // TODO: Implement shift + tab
        document.execCommand("insertText", false, tabulationText);
      } else if (e.key === "Enter") {
        e.preventDefault();

        let tabulation = currentTabulation;
        if (currentLine.endsWith("{")) {
          tabulation += tabulationText;
        }

        document.execCommand("insertText", false, `\n${tabulation}`);
      }
    },
    []
  );

  return (
    <Textarea
      data-1p-ignore
      rows={rows || 12}
      className={cn("resize-none font-mono text-xs whitespace-pre", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
