import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { HTMLAttributes, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePlugin } from "..";

export function ImportPlugin({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLLabelElement>) {
  const { save: savePlugin } = usePlugin();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
  }, []);

  const handleOnChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    Promise.all(
      files.map((it) =>
        it.text().then((source) => {
          const dataUri = `data:text/javascript;charset=utf-8,${source}`;
          return import(/* @vite-ignore */ dataUri).then(
            (module) => module.default,
          );
        }),
      ),
    ).then((pluginList) => {
      pluginList.forEach((it) => savePlugin(it));
      toast.success("Plugins salvos com sucesso");
    });

    e.target.value = "";
  }, []);

  const handleClick = useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.click();
  }, []);

  return (
    <label className={cn("", className)} {...props}>
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        accept=".ts"
        onChange={handleOnChange}
      />
      <Slot onClick={handleClick}>{children}</Slot>
    </label>
  );
}
