import { GridItemActions } from "@/features/grid/types/tmux-grid";
import { Stream } from "@/features/stream/components/Stream";
import { cn } from "@/lib/utils";
import { useBucketSlots } from "../hooks/use-bucket-slots";
import { useBuckets } from "../hooks/use-buckets";
import { parseBucketUrl } from "../lib/utils";

export interface BucketSlotStreamProps {
  content: string;
  grid: GridItemActions;
}

export function BucketSlotStream({ content, grid }: BucketSlotStreamProps) {
  const ref = parseBucketUrl(content);
  const { findById } = useBuckets();
  const bucket = ref ? findById(ref.bucketId) : undefined;
  const { slots } = useBucketSlots(bucket);

  if (!ref) return <BucketSlotEmpty message="Invalid bucket reference" />;
  if (!bucket) return <BucketSlotEmpty message="Bucket not found" />;

  const resolved = slots[ref.slotIndex] ?? null;
  if (!resolved) {
    return (
      <BucketSlotEmpty
        message={
          bucket.streams.length === 0
            ? "Empty bucket"
            : "Waiting for online stream..."
        }
      />
    );
  }

  return <Stream key={resolved} url={resolved} grid={grid} />;
}

function BucketSlotEmpty({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "h-full w-full flex items-center justify-center",
        "bg-black/60 text-white/70 text-sm rounded-xl",
      )}
    >
      {message}
    </div>
  );
}
