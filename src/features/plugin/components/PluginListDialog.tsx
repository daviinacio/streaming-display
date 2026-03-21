import {
  Button,
  ButtonProps,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { Switch } from "@/components/ui/switch";
import useAlertDialog from "@/hooks/use-alert-dialog";
import { cn, downloadUrl } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import {
  FileDownIcon,
  ImportIcon,
  PencilIcon,
  Plug2Icon,
  PlusCircleIcon,
  TrashIcon,
} from "lucide-react";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePlugin } from "../hooks/use-plugin";
import { Plugin } from "../types";
import { PluginEditorDialog } from "./PluginEditorDialog";
import { ImportPlugin } from "./ImportPlugin";

export type PluginListDialogProps = PropsWithChildren;

export function PluginListDialog({ children }: PluginListDialogProps) {
  const { list, remove, findPluginRawById } = usePlugin();
  const [open, setOpen] = useState(false);
  // const [showHidden, setShowHidden] = useState(false);

  const alert = useAlertDialog();

  const [pluginEditDialog, setPluginEditDialog] = useState({
    id: undefined as undefined | string,
    open: false,
  });

  useEffect(() => {
    // open && setShowHidden(false);
  }, [open]);

  const handleCreate = useCallback(() => {
    setPluginEditDialog({
      id: undefined,
      open: true,
    });
  }, []);

  const handleView = useCallback((id: string) => {
    console.log("view", `'${id}'`);
    setPluginEditDialog({
      id,
      open: true,
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    setPluginEditDialog({
      id,
      open: true,
    });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await alert
        .confirm("Delete source handler", "Are you sure you want to delete it?")
        .then((r) => r && remove(id));
    },
    [remove],
  );

  const handleExport = useCallback(
    async (id: string) => {
      const pluginRaw = findPluginRawById(id);
      if (!pluginRaw) return toast.error(`Plugin download not available`);
      const filename = `${pluginRaw.name.toLowerCase()}.plugin.ts`;

      const content = encodeURIComponent(
        `export default ${JSON.stringify(pluginRaw)}`,
      );
      downloadUrl(`data:text/javascript;charset=utf-8,${content}`, filename);
    },
    [findPluginRawById],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}

        <DialogContent
          className={cn("h-full sm:max-w-[400px] sm:min-h-[300px] sm:h-fit")}
        >
          <DialogHeader className="flex flex-row items-center gap-3">
            <Plug2Icon className="rotate-45 size-8" />
            <div>
              <DialogTitle>Plugin Editor</DialogTitle>
              <DialogDescription>
                Extend the app capabilities with a plugin
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="h-full">
            <div>
              <h3 className="text-sm font-semibold"> Built-in plugins</h3>
              <PluginList
                list={list.filter((it) => it.isBuiltin)}
                onView={handleView}
              />
            </div>

            <div className="mt-2">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">Plugins</h3>
                {/* <Button
                  variant="link"
                  size="link"
                  className="text-background cursor-default"
                  onClick={() => setShowHidden((p) => !p)}
                >
                  Toggle hidden
                </Button> */}
              </div>

              <PluginList
                list={list.filter((it) => !it.isBuiltin)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between sm:flex-row">
            <div className="grid sm:flex gap-2">
              <ImportPlugin>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 w-full"
                >
                  <ImportIcon className="size-4" />
                  Import
                </Button>
              </ImportPlugin>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreate}
                className="gap-2 flex-1"
              >
                <PlusCircleIcon className="size-4" />
                Create a new plugin
              </Button>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="sm:hidden">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PluginEditorDialog
        id={pluginEditDialog.id}
        open={pluginEditDialog.open}
        onOpenChange={() => setPluginEditDialog((p) => ({ ...p, open: false }))}
      />
    </>
  );
}

export type PluginListProps = {
  list: Plugin[];
  onView?: (name: string) => void;
  onEdit?: (name: string) => void;
  onDelete?: (name: string) => void;
  onExport?: (name: string) => void;
};

export function PluginList({
  list,
  onView,
  onEdit,
  onDelete,
  onExport,
}: PluginListProps) {
  const { updatePluginEnabled } = usePlugin();
  return (
    <Table>
      <TableBody>
        {list.length === 0 && (
          <TableRow className="pointer-events-none">
            <TableCell className="text-yellow-500">
              There's no plugins here
            </TableCell>
          </TableRow>
        )}
        {list.map((it) => (
          <TableRow key={it.id}>
            {!it.isBuiltin && (
              <TableCell className="w-1">
                <Switch
                  size="sm"
                  checked={it.enabled}
                  onCheckedChange={(checked) =>
                    updatePluginEnabled(it.id, checked)
                  }
                />
              </TableCell>
            )}
            <TableCell
              className={cn("font-medium", onView && "cursor-pointer")}
              onClick={() => onView && onView(it.id)}
            >
              <div className="flex items-center gap-2">
                {/* {handler.icon && (
                  <img src={handler.icon} className="size-4 select-none" />
                )} */}
                {it.name}
                {/* {handler.hidden && <EyeOffIcon className="w-4 h-4" />} */}
              </div>
            </TableCell>

            {onEdit && (
              <TableCell className="w-[1px] p-1">
                <TableCellActionButton
                  title="Edit"
                  onClick={() => onEdit && onEdit(it.id)}
                >
                  <PencilIcon />
                </TableCellActionButton>
              </TableCell>
            )}

            {onExport && (
              <TableCell className="w-[1px] p-1">
                <TableCellActionButton
                  title="Export"
                  onClick={() => onExport && onExport(it.id)}
                >
                  <FileDownIcon />
                </TableCellActionButton>
              </TableCell>
            )}

            {onDelete && (
              <TableCell className="w-[1px] p-1">
                <TableCellActionButton
                  title="Delete"
                  onClick={() => onDelete && onDelete(it.id)}
                  className="hover:!bg-destructive hover:!text-destructive-foreground"
                >
                  <TrashIcon />
                </TableCellActionButton>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TableCellActionButton({
  className,
  children,
  title,
  ...props
}: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "h-7 w-7 hover:!bg-muted-foreground hover:!text-background",
              className,
            )}
            variant="ghost"
            size="icon"
            {...props}
          >
            <Slot className={cn("w-4 h-4")}>{children}</Slot>
          </Button>
        </TooltipTrigger>
        {title && <TooltipContent>{title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
