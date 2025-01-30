import { VideoPlayer } from "@/components/domains/video/video-player";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { GridItem, GridItemPosition } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const gWidth = 1200;
const gHeight = 1200;
export default function GridViewPage() {
  const sh = useSourceHandlers();
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  const handleAddItem = useCallback(
    (url: string) => {
      try {
        if (gridItems.some((gi) => gi.url === url))
          throw new Error("URL already in the grid");

        const handler = sh.findHandler(url);
        if (!handler)
          throw new Error("There's no handler available for this URL");

        const item: GridItem = {
          column: 1,
          row: 1,
          sourceHandlerId: handler.id,
          url,
        };

        setGridItems((p) => {
          return [...p, item];
        });
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    },
    [sh, gridItems]
  );

  useEffect(() => {}, [handleAddItem]);

  // useEffect(() => {
  //   Promise.all(
  //     gridItems.map(async (gi) => {
  //       console.log(gi.url);
  //       gi.sourceHandler
  //         .resolver({
  //           url: gi.url,
  //         })
  //         .then((result) => console.log("resolver", result));
  //     })
  //   );
  // }, [gridItems]);

  const items = useMemo<GridItemPosition[]>(
    () =>
      gridItems.map((gi) => {
        return {
          ...gi,
          x: 1, //gWidth / 4,
          y: 1, //gHeight / 4,
          width: gWidth / 2,
          height: gHeight / 2,
        };
      }),
    [gridItems]
  );

  return (
    <div
      className="h-full grid"
      style={{
        gridTemplateColumns: `repeat(${gWidth}, 1fr)`,
        gridTemplateRows: `repeat(${gHeight}, 1fr)`,
      }}
    >
      {items.map((it) => (
        <VideoPlayer
          key={it.url}
          item={it}
          grid={{
            width: gWidth,
            height: gHeight,
          }}
        />
      ))}
    </div>
  );
}
