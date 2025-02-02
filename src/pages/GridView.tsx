import { Grid } from "@/components/domains/grid/grid";
import { VideoPlayer } from "@/components/domains/video/video-player";
import { DropArea, DropLocation } from "@/components/drag-n-drop/drop-area";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { GridItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function GridViewPage() {
  const sh = useSourceHandlers();
  const [gridItems, setGridItems] = useState<GridItem[]>([
    // {
    //   // url: "https://www.twitch.tv/oisakura",
    //   url: "https://www.twitch.tv/paladinxpg",
    //   column: 1,
    //   row: 1,
    // },
    // {
    //   url: "https://www.twitch.tv/rbiana",
    //   column: 0,
    //   row: 0,
    // },
    // {
    //   url: "https://www.twitch.tv/isaroza_",
    //   column: 1,
    //   row: 0,
    // },
    // {
    //   // url: "https://www.twitch.tv/casaldenerd",
    //   url: "https://www.youtube.com/watch?v=n1rdWFRmAB4",
    //   column: 0,
    //   row: 1,
    // },
  ]);

  useEffect(() => {
    const direction = true;
    // TODO: Implement keyboard shortcut for flip items position
    setTimeout(() => {
      // Flip items
      setGridItems((prev) => {
        const result = prev.map((p) => ({ ...p }));
        prev.forEach((_, i, a) => {
          const ni = (i + 1) % a.length;
          result[direction ? i : ni].row = a[direction ? ni : i].row;
          result[direction ? i : ni].column = a[direction ? ni : i].column;
        });
        return result;
      });
    }, 100);
  }, []);

  const getLastRowOfColumn = useCallback(
    (column: number) => {
      return Math.max(
        ...gridItems.filter((gi) => gi.column === column).map((gi) => gi.row),
        0
      );
    },
    [gridItems]
  );

  const handleRemove = useCallback((url: string) => {
    setGridItems((prev) => prev.filter((p) => p.url !== url));
  }, []);

  const handleDrop = useCallback(
    (url: string, location: DropLocation, currentUrl?: string) => {
      setGridItems((prev) => {
        const gridItems = [...prev];

        if (gridItems.some((gi) => gi.url === url)) {
          toast.error("URL already in the grid");
          return gridItems;
        }

        const handler = sh.findHandler(url);
        if (!handler) {
          toast.error("There's no handler available for this URL");
          return gridItems;
        }

        if (url === currentUrl) return gridItems;

        const urlItem = gridItems.find((it) => it.url === url);
        const currentItem = gridItems.find((it) => it.url === currentUrl);

        if (!currentItem) {
          gridItems.push({ url, column: 0, row: 0 });
          return gridItems;
        }

        const tempCurrentItem = { ...currentItem };

        if (location === "center" && urlItem) {
          currentItem.column = urlItem.column;
          currentItem.row = urlItem.row;
          urlItem.column = tempCurrentItem.column;
          urlItem.row = tempCurrentItem.row;
        } else if (location === "center") {
          currentItem.url = url;
        } else if (location === "left" && urlItem) {
        } else if (location === "left") {
          const newColumn = currentItem.column - 1;
          gridItems.push({
            url,
            column: newColumn,
            row: getLastRowOfColumn(newColumn),
          });
        } else if (location === "right" && urlItem) {
        } else if (location === "right") {
          const newColumn = currentItem.column + 1;
          gridItems.push({
            url,
            column: newColumn,
            row: getLastRowOfColumn(newColumn),
          });
        } else if (location === "top" && urlItem) {
        } else if (location === "top") {
          gridItems.push({
            url,
            column: currentItem.column,
            row: currentItem.row - 1,
          });
        } else if (location === "bottom" && urlItem) {
        } else if (location === "bottom") {
          gridItems.push({
            url,
            column: currentItem.column,
            row: currentItem.row + 1,
          });
        }

        console.log({
          url,
          location,
          currentUrl,
        });

        return gridItems;
      });
    },
    [sh, sh.custom, getLastRowOfColumn]
  );

  // console.table(gridItems);

  return (
    <div className="h-full bg-primary">
      <DropArea
        onDrop={handleDrop}
        onlyCenter={true}
        className={cn(
          "bg-background rounded-t-xl p-0",
          gridItems.length === 0 && "p-1"
        )}
        disabled={gridItems.length > 0}
      >
        {gridItems.length > 0 && (
          <Grid>
            {gridItems.map((it) => (
              <VideoPlayer
                key={it.url}
                item={it}
                onDrop={handleDrop}
                onRemove={handleRemove}
              />
            ))}
          </Grid>
        )}
      </DropArea>
    </div>
  );
}
