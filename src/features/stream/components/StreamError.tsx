import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface StreamErrorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  error: Error | null;
}

export function StreamError({ error, className, ...props }: StreamErrorProps) {
  if (!error) return;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-black/70 flex flex-col gap-1 items-center justify-center",
        "[&_a]:underline [&_a]:text-base hover:[&_a]:text-destructive text-center",
        className,
      )}
      {...props}
    >
      {error?.message?.split("\n").map((m, i) =>
        i === 0 ? (
          <h4 key={i} className="text-2xl text-destructive font-bold mb-2">
            {m}
          </h4>
        ) : (
          <span
            key={i}
            className="text-base leading-5"
            dangerouslySetInnerHTML={{ __html: m }}
          />
        ),
      )}
    </div>
  );
}
