import { Toaster } from "@/components/ui/sonner";
import { AlertDialogProvider } from "@/providers/alert-dialog-provider";
import { ReactQueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PropsWithChildren } from "react";
import { SourceHandlerProvider } from "./source-handler-provider";
import { PluginProvider } from "@/features/plugin/hooks/use-plugin";
import { BucketsProvider } from "@/features/bucket/hooks/use-buckets";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import {
  LocalStateProvider,
  SessionStateProvider,
} from "@daviapps/react-utils/hooks";

export function Providers({ children }: PropsWithChildren) {
  return (
    <SessionStateProvider>
      <LocalStateProvider>
        <SourceHandlerProvider>
          <ThemeProvider defaultTheme="system">
            <AlertDialogProvider>
              <ReactQueryProvider>
                <HotkeysProvider>
                  <PluginProvider>
                    <BucketsProvider>{children}</BucketsProvider>
                  </PluginProvider>
                </HotkeysProvider>
                <Toaster position="top-right" duration={2000} />
              </ReactQueryProvider>
            </AlertDialogProvider>
          </ThemeProvider>
        </SourceHandlerProvider>
      </LocalStateProvider>
    </SessionStateProvider>
  );
}
