import { DropArea } from "@/components/DropArea";
import { TmuxGrid } from "@/features/grid/components/TmuxGrid";
import { TreeNode } from "@/features/grid/types";
import { usePlugin } from "@/features/plugin";
import { Stream } from "@/features/stream/components/Stream";
import { useUndoableState } from "@/hooks/use-undoable-state";
import { useHotkey } from "@tanstack/react-hotkeys";
import { toast } from "sonner";

const initialTree: TreeNode = {
  type: "pane",
  id: "root",
  content: "",
};

export default function GridViewPage() {
  const { findPluginByUrl } = usePlugin();
  const {
    state: tree,
    set: setTree,
    undo,
    redo,
  } = useUndoableState<TreeNode>(initialTree, "grid");

  useHotkey("Mod+Z", undo);
  useHotkey("Mod+Shift+Z", redo);

  return (
    <div className="h-full w-full bg-primary">
      <div className="bg-background/75 shadow-md shadow-black rounded-t-2xl h-full w-full p-0.5">
        <TmuxGrid
          tree={tree}
          onTreeChange={setTree}
          className=""
          renderItem={({ content, empty, list, actions }) => {
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
                  onDoubleClick={actions.toggleMaximize}
                  onDrop={(url, position, moving) => {
                    if (findPluginByUrl(url).length === 0) {
                      return toast.error(
                        "There's no plugin compatible with this url",
                      );
                    }

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
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
