import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { PropsWithChildren, useState } from "react";

export type ReactQueryProviderProps = PropsWithChildren;

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [persister] = useState(
    createSyncStoragePersister({
      storage: window.localStorage,
    })
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchIntervalInBackground: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 5 * 60 * 1000,
            refetchInterval: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
