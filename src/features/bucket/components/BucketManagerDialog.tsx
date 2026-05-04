import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import useAlertDialog from "@/hooks/use-alert-dialog";
import { cn } from "@/lib/utils";
import { FolderCogIcon, TrashIcon } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { useBuckets } from "../hooks/use-buckets";

export type BucketManagerDialogProps = PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function BucketManagerDialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: BucketManagerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { list, update, remove, removeStream } = useBuckets();
  const alert = useAlertDialog();

  const handleDelete = async (id: string, name: string) => {
    const ok = await alert.confirm(
      "Delete bucket",
      `Delete bucket "${name}"?`,
    );
    if (ok) remove(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <span onClick={() => setOpen(true)}>{children}</span>}
      <DialogContent
        className={cn("h-full sm:max-w-[480px] sm:min-h-[300px] sm:h-fit")}
      >
        <DialogHeader className="flex flex-row items-center gap-3">
          <FolderCogIcon className="size-8" />
          <div>
            <DialogTitle>Manage buckets</DialogTitle>
            <DialogDescription>
              Edit bucket name, slot count, and stream priorities.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {list.length === 0 && (
            <p className="text-sm text-yellow-500">There's no buckets yet</p>
          )}
          {list.map((bucket) => (
            <div
              key={bucket.id}
              className="border rounded-md p-3 grid gap-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={bucket.name}
                  onChange={(e) =>
                    update(bucket.id, { name: e.target.value })
                  }
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:!bg-destructive hover:!text-destructive-foreground"
                  onClick={() => handleDelete(bucket.id, bucket.name)}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between">
                  <Label>Slots</Label>
                  <span className="text-sm text-muted-foreground">
                    {bucket.slotCount}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={Math.max(8, bucket.streams.length || 1)}
                  step={1}
                  value={[bucket.slotCount]}
                  onValueChange={(v) =>
                    update(bucket.id, {
                      slotCount: Math.max(1, v[0] ?? 1),
                    })
                  }
                />
              </div>

              <div className="grid gap-1">
                <Label>Streams</Label>
                {bucket.streams.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No streams yet
                  </p>
                )}
                {bucket.streams
                  .slice()
                  .sort((a, b) => b.priority - a.priority)
                  .map((s) => (
                    <div
                      key={s.url}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="truncate flex-1" title={s.url}>
                        {s.url}
                      </span>
                      <Input
                        type="number"
                        className="w-16 h-7"
                        value={s.priority}
                        onChange={(e) => {
                          const newPriority = Number(e.target.value);
                          if (Number.isNaN(newPriority)) return;
                          update(bucket.id, {
                            streams: bucket.streams.map((it) =>
                              it.url === s.url
                                ? { ...it, priority: newPriority }
                                : it,
                            ),
                          });
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => removeStream(bucket.id, s.url)}
                      >
                        <TrashIcon className="size-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
