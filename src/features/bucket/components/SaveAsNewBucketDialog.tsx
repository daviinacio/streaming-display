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
import { generateId } from "@/lib/utils";
import { FolderPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuckets } from "../hooks/use-buckets";
import { buildBucketLayout } from "../lib/utils";

export interface SaveAsNewBucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAsNewBucketDialog({
  open,
  onOpenChange,
}: SaveAsNewBucketDialogProps) {
  const { create, setActiveBucket, snapshotRef } = useBuckets();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const snapshot = snapshotRef.current?.();
    if (!snapshot) {
      toast.error("No grid available to save");
      return;
    }

    const id = generateId();
    const { layout, streams } = buildBucketLayout(snapshot.tree, id);

    const bucket = create({
      id,
      name: trimmed,
      slotCount: Math.max(streams.length, 1),
      streams,
      layout,
    });
    setActiveBucket(bucket.id);
    toast.success(`Bucket "${trimmed}" saved`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-row items-center gap-3">
          <FolderPlusIcon className="size-8" />
          <div>
            <DialogTitle>Save as new bucket</DialogTitle>
            <DialogDescription>
              Captures the current grid layout and its streams.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="bucket-name">Name</Label>
            <Input
              id="bucket-name"
              placeholder="My bucket"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              Save bucket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
