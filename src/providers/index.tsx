import { Toaster } from "@/components/ui/sonner";
import { AlertDialogProvider } from "@/providers/alert-dialog-provider";
import { PreferenceProvider } from "@/providers/preference-provider";
import { ReactQueryProvider } from "@/providers/query-provider";
import { TempStorageProvider } from "@/providers/temp-storage-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PropsWithChildren } from "react";
import { SourceHandlerProvider } from "./source-handler-provider";

export function Providers({ children }: PropsWithChildren) {
  // useEffect(() => {
  //   const handler = () => {
  //     document.body.classList[document.fullscreenElement ? "add" : "remove"](
  //       "fullscreen"
  //     );
  //   };

  //   document.addEventListener("fullscreenchange", handler);
  //   return () => document.removeEventListener("fullscreenchange", handler);
  // }, []);

  return (
    <TempStorageProvider>
      <PreferenceProvider>
        <SourceHandlerProvider>
          <ThemeProvider defaultTheme="system">
            <AlertDialogProvider>
              <ReactQueryProvider>
                {children}
                <Toaster position="top-center" />
              </ReactQueryProvider>
            </AlertDialogProvider>
          </ThemeProvider>
        </SourceHandlerProvider>
      </PreferenceProvider>
    </TempStorageProvider>
  );
}
