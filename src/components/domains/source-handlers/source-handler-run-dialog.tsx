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
  DraggableDialogContent,
  Input,
} from "@/components/ui";
import { Form, FormField } from "@/components/ui/form";
import { SimpleCodeEditor } from "@/components/widget/code-editor-simple";
import { SourceHandler } from "@/lib/types";
import { cn, findWildcard } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  SourceHandlerSchema,
  sourceHandlerSchemaToJavascript,
} from "./source-handler-edit-dialog";
import { useTemporaryState } from "@/hooks/use-temporary-state";

export type RunSourceHandlerDialogProps = PropsWithChildren<{
  sourceHandler: SourceHandlerSchema;
}>;

const RunSourceHandlerSchema = z.object({
  url: z.string().min(1, "Required").url(),
  result: z.string().optional(),
});

type RunSourceHandlerSchema = z.infer<typeof RunSourceHandlerSchema>;

export function RunSourceHandlerDialog({
  sourceHandler,
  children,
}: RunSourceHandlerDialogProps) {
  const [open, setOpen] = useState(false);
  const [testUrl, setTestUrl] = useTemporaryState<string>(
    `run:${sourceHandler.id || "new"}`,
    ""
  );

  const form = useForm<RunSourceHandlerSchema>({
    resolver: zodResolver(RunSourceHandlerSchema),
    defaultValues: {
      url: "",
      result: "",
    },
  });

  useEffect(() => {
    if (open) form.setValue("url", testUrl);
    else if (form.watch("url")) setTestUrl(form.watch("url"));
  }, [open, testUrl]);

  const run = useMutation({
    mutationFn: async ({ url }: RunSourceHandlerSchema) => {
      if (!findWildcard(sourceHandler.urlMatch, url)) {
        form.setError("url", {
          message: "URL does not match with the current handler",
        });
        return;
      }

      form.setValue("result", "Fetching...");

      try {
        const handler = (
          await import(
            /* @vite-ignore */ sourceHandlerSchemaToJavascript(sourceHandler)
          )
        ).default as SourceHandler;

        form.setValue("result", "Log:\n");

        const result = await handler.resolver({
          url,
          minimize: () =>
            form.setValue(
              "result",
              form.watch("result") + `Triggered minimize")\n`
            ),
          setRefetchInterval: (value) =>
            form.setValue(
              "result",
              form.watch("result") + `refetchInterval = ${value}\n`
            ),
        });

        form.setValue(
          "result",
          form.watch("result") +
            "\nData:\n" +
            JSON.stringify(result, undefined, 2)
        );
        return result;
      } catch (err) {
        if (err instanceof Error) {
          form.setValue("result", `[ERROR]: ${err.message}`);
        }
        // if (err instanceof Error) {
        //   form.setError("url", {
        //     message: err.message,
        //   });
        // }
      }
      return null;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DraggableDialogContent
        className="sm:max-w-[400px] h-full sm:h-[500px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Run</DialogTitle>
          <DialogDescription>Test the current implementation</DialogDescription>
        </DialogHeader>
        <Form
          className="flex-1 flex flex-col"
          form={form}
          onSubmit={(e) => {
            e.stopPropagation();
            form.handleSubmit((data) => run.mutateAsync(data))(e);
          }}
        >
          <div className="flex-1 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="url"
              label="Test URL"
              className="flex-none"
            >
              <Input placeholder="https://example.com/*" />
            </FormField>

            <FormField control={form.control} name="result" label="Result">
              <SimpleCodeEditor className="min-h-[200px]" readOnly={true} />
            </FormField>
          </div>
          <DialogFooter>
            <div className="grid sm:flex gap-2">
              <Button type="submit" disabled={false}>
                <PlayIcon className={cn("size-4", run.isPending && "hidden")} />
                Run
              </Button>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DraggableDialogContent>
    </Dialog>
  );
}
