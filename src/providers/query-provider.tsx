import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useEffect, useMemo } from "react";
import * as keyval from "idb-keyval";

export type ReactQueryProviderProps = PropsWithChildren;

const storageKey = "REACT_QUERY_OFFLINE_CACHE";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 60;

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: {
          getItem: async (key: string) => {
            const val = await keyval.get(key);
            console.debug(
              `[IndexedDB] Read cache: ${val ? "SUCCESS" : "EMPTY"}`,
            );
            return val ?? null;
          },
          setItem: async (key: string, value: string) => {
            try {
              await keyval.set(key, value);
              console.debug(
                `[IndexedDB] Cache saved! size: ${(value.length / 1024).toFixed(2)} KB`,
              );
            } catch (e) {
              console.error(`[IndexedDB] FATAL ERROR ON SAVE:`, e);
            }
          },
          removeItem: async (key: string) => {
            await keyval.del(key);
            console.debug(`[IndexedDB] Removing cache: ${key}`);
          },
        },
      }),
    [],
  );

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            throwOnError: false,
            retry: () => {
              return false;
            },
            refetchInterval: false,
            gcTime: CACHE_MAX_AGE,
            refetchOnReconnect: "always",
            // refetchOnMount: "always",
            staleTime: 0,
            networkMode: "offlineFirst",
          },
          mutations: {
            networkMode: "offlineFirst",
          },
        },
      }),
    [],
  );

  useEffect(() => {
    function storageHandler(event: StorageEvent) {
      if (event.key === storageKey) {
        console.log("query-changed");
        persister.restoreClient();
        // const value = JSON.parse(event.newValue || "{}") as PersistedClient;
        // persister.persistClient(value);
        // persister.restoreClient();
        // console.log("storage event", value);
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
        buster: "v2",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.state.data !== undefined;
          },
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </PersistQueryClientProvider>
  );
}
