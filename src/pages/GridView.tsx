import { Draggable } from "@/components/domains/drag-n-drop/draggable";
import { DropArea } from "@/components/domains/drag-n-drop/drop-area";
import { TmuxGrid } from "@/features/grid/components/tmux-grid";
import { usePlugin } from "@/features/plugin";
import { Stream } from "@/features/stream/components/Stream";
import { toast } from "sonner";

export default function GridViewPage() {
  const { findPluginByUrl } = usePlugin();

  return (
    <div className="h-full w-full bg-primary">
      <div className="bg-background/75 shadow-md shadow-black rounded-t-2xl h-full w-full p-0.5">
        <TmuxGrid
          className=""
          renderItem={({ content, empty, list, swap, set, move, add }) => {
            function validate(url: string) {
              if (findPluginByUrl(url).length === 0) {
                toast.error("There's no plugin compatible with this url");
                return false;
              } else if (list.some((it) => it.content === url)) {
                toast.error("This url is already in the grid");
                return false;
              }

              return true;
            }

            return (
              <>
                <DropArea
                  onDrop={(url, position, moving) => {
                    if (findPluginByUrl(url).length === 0) {
                      return toast.error(
                        "There's no plugin compatible with this url",
                      );
                    }

                    if (moving) {
                      if (position === "center") swap(url);
                      else move(position, url);
                      return;
                    }

                    if (!validate(url)) return;

                    if (position === "center") set(url);
                    else add(position, url);
                  }}
                  className="rounded-lg overflow-hidden"
                  onlyCenter={empty}
                >
                  {content !== "" && <Stream url={content} />}
                </DropArea>
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
