import { VideoPlayer } from "@/components/domains/video/video-player";
import { GridItem, GridItemPosition } from "@/lib/types";
import { useMemo, useState } from "react";

const gWidth = 1200;
const gHeight = 1200;
export default function GridViewPage() {
  // const sh = useSourceHandlers();
  const [gridItems] = useState<GridItem[]>([
    {
      url: "https://www.twitch.tv/oisakura",
      column: 0,
      row: 0,
    },
    {
      url: "https://www.twitch.tv/rbiana",
      column: 0,
      row: 1,
    },
    {
      url: "https://www.twitch.tv/isaroza_",
      column: 1,
      row: 0,
    },
    {
      url: "https://www.twitch.tv/casaldenerd",
      column: 1,
      row: 1,
    },
  ]);

  // const handleAddItem = useCallback(
  //   (url: string) => {
  //     try {
  //       if (gridItems.some((gi) => gi.url === url))
  //         throw new Error("URL already in the grid");

  //       const handler = sh.findHandler(url);
  //       if (!handler)
  //         throw new Error("There's no handler available for this URL");

  //       const item: GridItem = {
  //         column: 1,
  //         row: 1,
  //         sourceHandlerId: handler.id,
  //         url,
  //       };

  //       setGridItems((p) => {
  //         return [...p, item];
  //       });
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         toast.error(err.message);
  //       }
  //     }
  //   },
  //   [sh, gridItems]
  // );

  const items = useMemo<GridItemPosition[]>(
    () =>
      gridItems.map((gi) => {
        return {
          ...gi,
          x: gi.row * (gWidth / 2), //gWidth / 4,
          y: gi.column * (gHeight / 2), //gHeight / 4,
          width: gWidth / 2,
          height: gHeight / 2,
        };
      }),
    [gridItems]
  );

  return (
    <div className="h-full bg-primary">
      <div
        className="h-full grid p-1 group/grid  bg-background rounded-t-xl"
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
    </div>
  );
}
