import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FolderInputIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { nextPriority, useBuckets } from "../hooks/use-buckets";

const NEW_BUCKET_VALUE = "__new__";

export interface AddStreamToBucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  initialBucketId?: string;
}

export function AddStreamToBucketDialog({
  open,
  onOpenChange,
  initialUrl = "",
  initialBucketId,
}: AddStreamToBucketDialogProps) {
  const { list, create, addStream, findById } = useBuckets();

  const [url, setUrl] = useState(initialUrl);
  const [bucketId, setBucketId] = useState<string>("");
  const [newBucketName, setNewBucketName] = useState("");
  const [priority, setPriority] = useState(0);

  const selectedBucket = useMemo(
    () => (bucketId && bucketId !== NEW_BUCKET_VALUE ? findById(bucketId) : undefined),
    [bucketId, findById],
  );

  useEffect(() => {
    if (!open) return;
    setUrl(initialUrl);
    setNewBucketName("");
    if (initialBucketId) {
      setBucketId(initialBucketId);
    } else if (list.length > 0) {
      setBucketId(list[0].id);
    } else {
      setBucketId(NEW_BUCKET_VALUE);
    }
  }, [open, initialUrl, initialBucketId, list]);

  useEffect(() => {
    if (selectedBucket) {
      setPriority(nextPriority(selectedBucket.streams));
    } else {
      setPriority(0);
    }
  }, [selectedBucket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let targetId = bucketId;

    if (bucketId === NEW_BUCKET_VALUE) {
      const trimmedName = newBucketName.trim();
      if (!trimmedName) {
        toast.error("Bucket name is required");
        return;
      }
      const bucket = create({
        name: trimmedName,
        slotCount: 1,
        streams: [],
      });
      targetId = bucket.id;
    }

    if (!targetId) return;
    addStream(targetId, { url: trimmedUrl, priority });
    toast.success("Stream added to bucket");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="flex flex-row items-center gap-3">
          <FolderInputIcon className="size-8" />
          <div>
            <DialogTitle>Add stream to bucket</DialogTitle>
            <DialogDescription>
              The bucket auto-fills its slots with online streams by priority.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="bucket-stream-url">Stream URL</Label>
            <Input
              id="bucket-stream-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus={!initialUrl}
            />
          </div>

          <div className="grid gap-2">
            <Label>Bucket</Label>
            <Select value={bucketId} onValueChange={setBucketId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bucket" />
              </SelectTrigger>
              <SelectContent>
                {list.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_BUCKET_VALUE}>+ New bucket...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bucketId === NEW_BUCKET_VALUE && (
            <div className="grid gap-2">
              <Label htmlFor="new-bucket-name">New bucket name</Label>
              <Input
                id="new-bucket-name"
                placeholder="My bucket"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>Priority</Label>
              <span className="text-sm text-muted-foreground">{priority}</span>
            </div>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[priority]}
              onValueChange={(v) => setPriority(v[0] ?? 0)}
            />
          </div>

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!url.trim()}>
              Add stream
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
