import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  PersistedClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { PropsWithChildren, useEffect, useMemo } from "react";

export type ReactQueryProviderProps = PropsWithChildren;

const storageKey = "REACT_QUERY_OFFLINE_CACHE";

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const persister = useMemo(
    () =>
      createSyncStoragePersister({
        key: storageKey,
        storage: window.localStorage,
      }),
    []
  );

  const queryClient = useMemo(
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
      }),
    []
  );

  useEffect(() => {
    function storageHandler(event: StorageEvent) {
      if (event.key === storageKey) {
        const value = JSON.parse(event.newValue || "{}") as PersistedClient;
        persister.persistClient(value);
        persister.restoreClient();
        console.log("storage event", value);

        // value.clientState.queries.forEach((query) => {
        //   const currState = queryClient.getQueriesData
        //   queryClient.setQueryData(query.queryKey, () => query.state.data);
        // });
      }
    }

    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, [persister, queryClient]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </PersistQueryClientProvider>
  );
}
