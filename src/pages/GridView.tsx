import { DropArea } from "@/components/DropArea";
import {
  fallbackInitialTree,
  TmuxGrid,
} from "@/features/grid/components/TmuxGrid";
import { equalizeTree } from "@/features/grid/lib";
import { TreeNode } from "@/features/grid/types/tmux-grid";
import { usePlugin } from "@/features/plugin";
import { Stream } from "@/features/stream/components/Stream";
import { generateId } from "@/lib/utils";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export default function GridViewPage() {
  const { "*": slug } = useParams();
  const { findComponentByUrl, findPluginByName } = usePlugin();

  const initialTree = useMemo<TreeNode>(() => {
    if (!slug) return fallbackInitialTree;

    const urls: string[] = [];
    const items = slug.split("/").filter(Boolean);

    items.forEach((it) => {
      const [pluginName, streamsString] = it.split(":");
      if (!pluginName || !streamsString) return;

      const plugin = findPluginByName(pluginName)[0];
      if (!plugin) return;

      const streams = streamsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      streams.forEach((streamName) => {
        urls.push(plugin.match[0].replace("*", streamName));
      });
    });

    if (urls.length === 0) return fallbackInitialTree;

    let tree: any = {
      type: "pane",
      id: generateId(),
      content: urls[0],
    };

    for (let i = 1; i < urls.length; i++) {
      let targetId = "";
      const findLastPane = (node: any) => {
        if (node.type === "pane") targetId = node.id;
        else findLastPane(node.second);
      };
      findLastPane(tree);

      const newTree = JSON.parse(JSON.stringify(tree));

      const splitNode = (node: any): boolean => {
        if (node.type === "pane" && node.id === targetId) {
          const newNode = { type: "pane", id: generateId(), content: urls[i] };
          const oldPane = { ...node };

          node.type = "split";
          node.id = generateId();
          node.direction = "V";
          node.ratio = 0.5;
          node.first = oldPane;
          node.second = newNode;
          delete node.content;

          return true;
        }
        if (node.type === "split") {
          return splitNode(node.first) || splitNode(node.second);
        }
        return false;
      };

      splitNode(newTree);
      tree = newTree;
    }
    equalizeTree(tree);

    return tree;
  }, [slug, findPluginByName]);

  return (
    <div className="h-full w-full bg-primary">
      <div className="bg-background/75 shadow-md shadow-black rounded-t-2xl h-full w-full p-0.5">
        <TmuxGrid
          className=""
          initialTree={initialTree}
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
