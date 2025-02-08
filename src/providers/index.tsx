import { Toaster } from "@/components/ui/sonner";
import { AlertDialogProvider } from "@/providers/alert-dialog-provider";
import { PreferenceProvider } from "@/providers/preference-provider";
import { ReactQueryProvider } from "@/providers/query-provider";
import { TemporaryStateProvider } from "@/providers/temporary-state-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PropsWithChildren } from "react";
import { SourceHandlerProvider } from "./source-handler-provider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <TemporaryStateProvider>
      <PreferenceProvider>
        <SourceHandlerProvider>
          <ThemeProvider defaultTheme="system">
            <AlertDialogProvider>
              <ReactQueryProvider>
                {children}
                <Toaster position="top-right" duration={2000} />
              </ReactQueryProvider>
            </AlertDialogProvider>
          </ThemeProvider>
        </SourceHandlerProvider>
      </PreferenceProvider>
    </TemporaryStateProvider>
  );
}
