import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui";
import useAlertDialog from "@/hooks/use-alert-dialog";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { SourceHandler } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  EyeOffIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "lucide-react";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { SourceHandlerEditDialog } from "./source-handler-edit-dialog";

export type SourceHandlerListDialogProps = PropsWithChildren;

export function SourceHandlerListDialog({
  children,
}: SourceHandlerListDialogProps) {
  const sh = useSourceHandlers();
  const [open, setOpen] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const alert = useAlertDialog();

  const [sourceHandlerEdit, setSourceHandlerEdit] = useState({
    id: undefined as undefined | string,
    open: false,
  });

  useEffect(() => {
    open && setShowHidden(false);
  }, [open]);

  const handleCreate = useCallback(() => {
    setSourceHandlerEdit({
      id: undefined,
      open: true,
    });
  }, []);

  const handleView = useCallback((id: string) => {
    console.log("view", `'${id}'`);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      setSourceHandlerEdit({
        id,
        open: true,
      });
    },
    [setSourceHandlerEdit]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !(await alert.confirm(
          "Delete source handler",
          "Are you sure you want to delete it?"
        ))
      )
        return;
      sh.remove(id);
    },
    [sh]
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}

        <DialogContent className="sm:max-w-[400px] h-full sm:h-fit">
          <DialogHeader>
            <DialogTitle>Source handlers</DialogTitle>
            <DialogDescription>
              Manage built-in and custom source handlers
            </DialogDescription>
          </DialogHeader>
          <div className="h-full">
            <div>
              <h3 className="text-sm font-semibold"> Built-in handlers</h3>
              <SourceHandlerList
                handlers={sh.builtIn.filter((h) => !h.hidden)}
                onView={handleView}
              />
            </div>

            <div className="mt-2">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">Custom handlers</h3>
                <Button
                  variant="link"
                  size="link"
                  className="text-background cursor-default"
                  onClick={() => setShowHidden((p) => !p)}
                >
                  Toggle hidden
                </Button>
              </div>

              <SourceHandlerList
                handlers={sh.custom.filter((h) => !h.hidden || showHidden)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
          <DialogFooter className="md:justify-between md:flex-row">
            <div className="grid sm:flex gap-2">
              {/* <Button type="button" variant="outline" className="gap-2">
                <ImportIcon className="size-4" />
                Import
              </Button> */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCreate}
                className="gap-2"
              >
                <PlusCircleIcon className="size-4" />
                Create custom
              </Button>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="md:hidden">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SourceHandlerEditDialog
        {...sourceHandlerEdit}
        onOpenChange={() =>
          setSourceHandlerEdit((p) => ({ ...p, open: false }))
        }
      />
    </>
  );
}

export type SourceHandlerListProps = {
  handlers: SourceHandler[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function SourceHandlerList({
  handlers,
  onView,
  onEdit,
  onDelete,
}: SourceHandlerListProps) {
  return (
    <Table>
      <TableBody>
        {handlers.length === 0 && (
          <TableRow className="pointer-events-none">
            <TableCell className="text-yellow-500">
              There's no handlers here
            </TableCell>
          </TableRow>
        )}
        {handlers.map((handler) => (
          <TableRow key={handler.id}>
            <TableCell
              className={cn("font-medium", onView && "cursor-pointer")}
              onClick={() => onView && onView(handler.id)}
            >
              <div className="flex items-center gap-2">
                {handler.icon && (
                  <img src={handler.icon} className="size-4 select-none" />
                )}
                {handler.label}
                {handler.hidden && <EyeOffIcon className="w-4 h-4" />}
              </div>
            </TableCell>

            {onEdit && (
              <TableCell className="w-0 p-1">
                <Button
                  onClick={() => onEdit && onEdit(handler.id)}
                  className="h-7 w-7 hover:!bg-muted-foreground hover:!text-background"
                  variant="ghost"
                  size="icon"
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </TableCell>
            )}

            {onDelete && (
              <TableCell className="w-0 p-1">
                <Button
                  onClick={() => onDelete && onDelete(handler.id)}
                  className="h-7 w-7 hover:!bg-destructive hover:!text-destructive-foreground"
                  variant="ghost"
                  size="icon"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
