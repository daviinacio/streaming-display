import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  InputTextList,
  ResizablePanel,
  ResizablePanelGroup,
  ResizableSeparator,
} from "@/components/ui";
import {
  HtmlHTMLAttributes,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useFieldArray,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";

import { Form, FormField } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/widget";
import { PluginRawSchema } from "@/features/plugin/validation/plugin.schema";
import { zodSchemaDefaults } from "@daviapps/react-utils/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileIcon,
  Plug2Icon,
  PlusIcon,
  PuzzleIcon,
  Trash2Icon,
} from "lucide-react";
import useAlertDialog from "@/hooks/use-alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";
import { cn } from "@/lib/utils";
import useClickOutside from "@/hooks/use-click-outside";
import { Switch } from "@/components/ui/switch";
import { useHotkey } from "@tanstack/react-hotkeys";
import { DialogProps } from "@radix-ui/react-dialog";
import { usePlugin } from "../hooks/use-plugin";

export function PluginEditorDialog({
  children,
  id,
  ...props
}: DialogProps & { id?: string }) {
  const [currentComponent, setCurrentComponent] = useState<number>(-1);
  const { save, findPluginRawById } = usePlugin();

  const form = useForm<PluginRawSchema>({
    defaultValues: zodSchemaDefaults(PluginRawSchema),
    resolver: zodResolver(PluginRawSchema),
  });

  const handleSubmit = useCallback(
    (data: PluginRawSchema) => {
      console.log("data", data);
      save(data);
      props.onOpenChange && props.onOpenChange(false);
    },
    [save],
  );

  useEffect(() => {
    if (!id) return form.reset();

    const pluginRaw = findPluginRawById(id);
    if (!pluginRaw) return;
    form.reset(pluginRaw);
  }, [id]);

  // useHotkey("Mod+S", (e) => {
  //   handleSubmit();
  //   e.preventDefault();
  // });

  return (
    <Dialog {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-32px)] w-full max-h-[calc(100%-32px)] h-full p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="pt-8 pb-2 pl-10 flex flex-row items-center gap-3">
          <Plug2Icon className="rotate-45 size-8" />
          <div>
            <DialogTitle>Plugin Editor</DialogTitle>
            <DialogDescription>
              Extend the app capabilities with a plugin
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(handleSubmit, (e) => console.error(e))}
          className="h-full"
        >
          <ResizablePanelGroup orientation="horizontal" className="">
            <ResizablePanel
              defaultSize="300px"
              minSize={250}
              className="flex flex-col"
            >
              <PluginDetail />
              <Separator />
              <ComponentList onSelect={(index) => setCurrentComponent(index)} />
            </ResizablePanel>
            <ResizableSeparator />
            <ResizablePanel minSize={500}>
              <Tabs value={String(currentComponent)} className="h-full">
                <TabsContent value={"-1"}></TabsContent>

                {!form.watch("components").at(currentComponent) && (
                  <div className="h-full mt-0 flex flex-col items-center justify-center text-muted-foreground">
                    <PuzzleIcon className="size-16" />
                    <span className="text-2xl font-bold mt-2">
                      No component select
                    </span>
                    <span className="text-lg">
                      Select or create a component on the left panel
                    </span>
                  </div>
                )}

                {form.watch("components").map((_, i) => (
                  <TabsContent
                    key={i}
                    value={String(i)}
                    className="h-full mt-0"
                  >
                    <FormField
                      control={form.control}
                      name={`components.${i}.code`}
                      className="h-[calc(100%-30px)] m-2 mb-0"
                    >
                      <CodeEditor
                        className="border-transparent has-[:focus-visible]:border-transparent has-[:focus-visible]:ring-transparent"
                        language="typescript"
                      />
                    </FormField>
                  </TabsContent>
                ))}
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PluginDetail() {
  const form = useFormContext<PluginRawSchema>();
  return (
    <div className="p-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
        Plugin details
      </h3>
      <FormField control={form.control} name="name" label="Plugin name">
        <Input placeholder="Type a name to the plugin" />
      </FormField>
      <FormField
        control={form.control}
        name="match"
        label="Matches"
        className="col-span-2 md:col-span-1"
      >
        <InputTextList placeholder="https://example.com/*" />
      </FormField>
    </div>
  );
}

interface ComponentListProps {
  onSelect: (index: number) => void;
}

function ComponentList({ onSelect }: ComponentListProps) {
  const form = useFormContext<PluginRawSchema>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  // useEffect(() => console.table(form.watch("components")), [form.watch()]);

  return (
    <div className="p-4 flex-1 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
          Components
        </h3>
        <Button
          variant="ghost"
          className="size-6 p-0"
          onClick={() =>
            append({
              enabled: true,
              type: "Player",
              code: "",
              name: "",
              isEdit: true,
              isDirty: false,
            })
          }
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {fields.map((_, i) => (
          <ComponentListItem
            key={i}
            index={i}
            onRemove={() => remove(i)}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </div>
  );
}

interface ComponentListItemProps {
  index: number;
  onRemove: () => void;
  onSelect: () => void;
}

function ComponentListItem({
  index,
  onRemove,
  onSelect,
}: ComponentListItemProps) {
  const form = useFormContext<PluginRawSchema>();
  const alert = useAlertDialog();

  const [isSelectTypeOpen, setIsSelectTypeOpen] = useState(false);

  const { name, isEdit, isDirty } = form.watch(`components.${index}`);

  function setIsEdit(v: boolean) {
    form.setValue(`components.${index}.isEdit`, v);
  }

  function setIsDirty(v: boolean) {
    form.setValue(`components.${index}.isDirty`, v);
  }

  const wrapperRef = useClickOutside(() => {
    if (!isEdit || isSelectTypeOpen) return;

    if (name !== "") {
      setIsEdit(false);
      setIsDirty(true);
    } else if (!isDirty) {
      return onRemove();
    }
  });

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex items-center gap-2",
        !isEdit && "cursor-pointer *:cursor-pointer",
      )}
      onDoubleClick={() => setIsEdit(true)}
      onClick={() => !isEdit && onSelect()}
    >
      {/* <FormField
        control={form.control}
        name={`components.${index}.enabled`}
        className="max-w-9"
      >
        <Switch size="sm" />
      </FormField> */}

      <FormField
        control={form.control}
        name={`components.${index}.type`}
        className="max-w-9"
      >
        <Select
          disabled={!isEdit}
          open={isSelectTypeOpen}
          onOpenChange={setIsSelectTypeOpen}
        >
          <SelectTrigger className="w-full border-0 !ring-0 shadow-none p-0">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent className="max-w-48">
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              {PLUGIN_TYPE_OPTIONS.map(({ icon: Icon, label, value }) => (
                <SelectItem value={value} key={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 min-w-4" />{" "}
                    <span className="">{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>

      <FormField control={form.control} name={`components.${index}.name`}>
        <Input
          placeholder="Component name ..."
          className={cn(
            "!ring-0 border-0 !shadow-none !p-0 h-fit",
            !isEdit && "cursor-pointer",
          )}
          readOnly={!isEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setIsEdit(false);
            }
          }}
        />
      </FormField>
      <Button
        className={cn("p-0 size-6 ", (!isEdit || !isDirty) && "hidden")}
        variant="ghost"
        onClick={() =>
          alert
            .confirm("Delete component", "Are you sure?")
            .then((r) => r && onRemove())
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
