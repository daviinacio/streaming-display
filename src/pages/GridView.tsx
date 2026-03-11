import { DropArea } from "@/components/DropArea";
import { TmuxGrid } from "@/features/grid/components/TmuxGrid";
import { usePlugin } from "@/features/plugin";
import { Stream } from "@/features/stream/components/Stream";
import { toast } from "sonner";

export default function GridViewPage() {
  const { findComponentByUrl } = usePlugin();

  return (
    <div className="h-full w-full bg-primary">
      <div className="bg-background/75 shadow-md shadow-black rounded-t-2xl h-full w-full p-0.5">
        <TmuxGrid
          className=""
          renderItem={({ content, empty, list, actions }) => {
            function validate(url: string) {
              console.log(123);
              const canHandle =
                findComponentByUrl(url, "player").length > 0 ||
                findComponentByUrl(url, "source_handler").length > 0;

              if (!canHandle) {
                toast.error("There's no plugin compatible with this url");
                return false;
              } else if (list.some((it) => it.content === url)) {
                toast.error("This url is already in the grid");
                return false;
              }

              return true;
            }

            return (
              <DropArea
                onDoubleClick={actions.toggleMaximize}
                onDragOver={actions.disableMaximize}
                onDrop={(url, position, moving) => {
                  console.debug("GridView :: DropArea -> onDrop");
                  if (moving) {
                    if (position === "center") actions.swap(url);
                    else actions.move(position, url);
                    return;
                  }

                  if (!validate(url)) return;

                  if (position === "center") actions.set(url);
                  else actions.add(position, url);
                }}
                className="rounded-lg overflow-hidden"
                onlyCenter={empty}
              >
                {content !== "" && <Stream url={content} grid={actions} />}
              </DropArea>
            );
          }}
        />
      </div>
    </div>
  );
}
