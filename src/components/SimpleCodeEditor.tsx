import { KeyboardEventHandler, useCallback } from "react";
import { Textarea, TextareaProps } from "@/components/ui";
import { cn } from "@/lib/utils";

const tabulationText = "  " as const;

export function SimpleCodeEditor({ rows, className, ...props }: TextareaProps) {
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
    [],
  );

  return (
    <Textarea
      data-1p-ignore
      className={cn(
        "resize-none font-mono text-xs whitespace-pre h-full",
        className,
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
