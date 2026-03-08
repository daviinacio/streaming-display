import { cn } from "@/lib/utils";
import { Tv2Icon } from "lucide-react";
import { useStream } from "../hooks/use-stream";
import { forwardRef } from "react";

export const StreamDragGhost = forwardRef<HTMLDivElement>((_, ref) => {
  const { src, handler } = useStream();

  return (
    <div
      className={cn(
        "border-2 px-2 h-[40px] bg-black/70 rounded-md flex items-center gap-2",
        false ? "border-destructive" : "border-primary",
      )}
      ref={ref}
    >
      <div>
        <Tv2Icon
          className={cn(
            "size-5",
            //error ? "text-destructive" : "text-primary"
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <p
          className={cn(
            "text-white text-lg font-semibold truncate max-w-[400px]",
            "drop-shadow-text",
          )}
        >
          {handler?.title || src}
        </p>
        {handler && handler.logo && (
          <img
            src={handler.logo}
            className="bg-cover h-[20px] min-h-[10px] pointer-events-none"
          />
        )}
      </div>
    </div>
  );
});
