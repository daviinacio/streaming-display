import {
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
import { useCallback, useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";

import { Form, FormField } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PluginRawSchema } from "@/features/plugin/validation/plugin.schema";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { zodSchemaDefaults } from "@daviapps/react-utils/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogProps } from "@radix-ui/react-dialog";
import { Plug2Icon, PuzzleIcon } from "lucide-react";
import { usePlugin } from "../hooks/use-plugin";
import { PluginComponentList } from "./PluginComponentList";
import { CodeEditor } from "@/components/CodeEditor";

export function PluginEditorDialog({
  children,
  id,
  ...props
}: DialogProps & { id?: string }) {
  const [currentComponent, setCurrentComponent] = useState<number>(-1);
  const { save, findPluginRawById } = usePlugin();
  const isDesktop = useIsDesktop();

  const form = useForm<PluginRawSchema>({
    defaultValues: zodSchemaDefaults(PluginRawSchema),
    resolver: zodResolver(PluginRawSchema),
  });

  const handleSubmit = useCallback(
    (data: PluginRawSchema) => {
      console.log("data", data);
      save({
        id: data.id,
        // @ts-ignore
        components: data.components,
        enabled: data.enabled,
        match: data.match,
        name: data.name,
      });
      props.onOpenChange && props.onOpenChange(false);
    },
    [save],
  );

  useEffect(() => {
    if (!id) return form.reset();

    const pluginRaw = findPluginRawById(id);
    if (!pluginRaw) return;
    form.reset(pluginRaw);
  }, [id, props.open]);

  useEffect(() => {
    setCurrentComponent(-1);
  }, [id]);

  // useHotkey("Mod+S", (e) => {
  //   handleSubmit();
  //   e.preventDefault();
  // });

  return (
    <Dialog {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[calc(100%-32px)] w-[1200px] sm:max-h-[calc(100%-32px)] h-full p-0 gap-0"
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
          <ResizablePanelGroup
            orientation={isDesktop ? "horizontal" : "vertical"}
            className=""
          >
            <ResizablePanel
              defaultSize="300px"
              minSize={250}
              className="flex flex-col"
            >
              <PluginDetail />
              <Separator />
              <PluginComponentList
                selected={currentComponent}
                onSelect={(index) => setCurrentComponent(index)}
              />
            </ResizablePanel>
            <ResizableSeparator withHandle={!isDesktop} />
            <ResizablePanel minSize={500}>
              <Tabs value={String(currentComponent)} className="h-full">
                {currentComponent === -1 && (
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
