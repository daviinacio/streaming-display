import { SourceHandler } from "@/lib/types";
import { findWildcard } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type SourceHandlerProviderProps = {
  children: React.ReactNode;
};

type SourceHandlerContextProps = {
  findHandler: (url: string) => SourceHandler | null;
  getById: (id?: string) => SourceHandler | null;
  save: (id: string, javascriptCode: string) => void;
  remove: (id: string) => void;
  builtIn: SourceHandler[];
  custom: SourceHandler[];
};

export const SourceHandlerProviderContext = createContext<
  SourceHandlerContextProps | undefined
>(undefined);

const storageKey = "source-handlers";

export function SourceHandlerProvider({
  children,
}: SourceHandlerProviderProps) {
  const [reload, setReload] = useState(false);
  const [builtInHandlers, setBuiltInHandlers] = useState<SourceHandler[]>([]);
  const [customHandlers, setCustomHandlers] = useState<SourceHandler[]>([]);

  const handlers = useMemo(
    () => [...builtInHandlers, ...customHandlers],
    [builtInHandlers, customHandlers]
  );

  const readCustomHandlers = useCallback(() => {
    return JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
  }, []);

  const writeCustomHandlers = useCallback((handlerList: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify(handlerList));
    setReload((p) => !p);
  }, []);

  useEffect(() => {
    (async function () {
      const builtinHandlers: SourceHandler[] = await Promise.all(
        Object.entries(import.meta.glob("/src/builtin-source-handlers/*")).map(
          ([_, file]) => file().then((module: any) => module.default)
        )
      );

      const customHandlers = await Promise.all(
        readCustomHandlers().map((source) =>
          import(/* @vite-ignore */ source).then((module) => module.default)
        )
      );

      setBuiltInHandlers(builtinHandlers);
      setCustomHandlers(customHandlers);
    })();
  }, [reload]);

  const handleFindState = useCallback<SourceHandlerContextProps["findHandler"]>(
    (url) => {
      return handlers.find((h) => findWildcard(h.urlMatch, url)) || null;
    },
    [handlers]
  );

  const getById = useCallback<SourceHandlerContextProps["getById"]>(
    (id) => {
      return Object.freeze(handlers.find((h) => h.id === id) || null);
    },
    [handlers]
  );

  const save = useCallback<SourceHandlerContextProps["save"]>(
    (id, javascriptCode) => {
      const handlerIndex = customHandlers.findIndex((h) => h.id === id);

      const data = readCustomHandlers();
      if (handlerIndex >= 0) data[handlerIndex] = javascriptCode;
      else data.push(javascriptCode);

      writeCustomHandlers(data);
    },
    [customHandlers]
  );

  const remove = useCallback<SourceHandlerContextProps["remove"]>(
    (id) => {
      const handlerIndex = customHandlers.findIndex((h) => h.id === id);
      const data = readCustomHandlers();
      writeCustomHandlers(data.filter((_, i) => i !== handlerIndex));
    },
    [customHandlers]
  );

  return (
    <SourceHandlerProviderContext.Provider
      value={{
        findHandler: handleFindState,
        builtIn: builtInHandlers,
        custom: customHandlers,
        getById,
        save,
        remove,
      }}
    >
      {children}
    </SourceHandlerProviderContext.Provider>
  );
}
