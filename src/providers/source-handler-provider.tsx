import { SourceHandler } from "@/lib/types";
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
  external: SourceHandler[];
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
  const [externalHandlers, setExternalHandlers] = useState<SourceHandler[]>([]);

  const handlers = useMemo(
    () => [...builtInHandlers, ...externalHandlers],
    [builtInHandlers, externalHandlers]
  );

  // const [handlers, setHandlers] = useState<SourceHandler[]>(
  //   []
  // );

  // useEffect(() => {
  //   const js = `export default {
  //   id: 'stripchat-handler',
  //   version: '1.0.0',
  //   label: 'Stripchat',
  //   logo: {
  //     url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/1280px-Logo_of_YouTube_%282015-2017%29.svg.png',
  //     height: '30px'
  //   },
  //   urlMatch: [
  //     'https://www.youtube.com/watch?v=*',
  //     'https://youtu.be/*'
  //   ],
  //   // urlMatch: (url) => url.includes('youtube'),
  //   resolver: async ({ url }) => {
  //     const metadata = await fetch(
  //       \`https://noembed.com/embed?url=$\{url\}\`
  //     ).then((response) => response.json())

  //     return \{
  //       title: metadata.title,
  //       status: "success",
  //       sourceUrl: url,
  //     }
  //   },
  //   allow: {
  //     fullscreen: true,
  //     pip: true,
  //     refresh: true,
  //     volume: true
  //   },
  //   hidden: true
  // }
  // `;

  //   const encodedJs = encodeURIComponent(js);
  //   const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;

  //   const test = [dataUri];
  //   localStorage.setItem(storageKey, JSON.stringify(test));

  //   // import(dataUri).then((d) => console.log({ d: d.default }));

  //   // console.log(dataUri);
  // }, []);

  const readExternalHandlers = useCallback(() => {
    return JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
  }, []);

  const writeExternalHandlers = useCallback((handlerList: string[]) => {
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

      const externalHandlers = await Promise.all(
        readExternalHandlers().map((source) =>
          import(source).then((module) => module.default)
        )
      );

      setBuiltInHandlers(builtinHandlers);
      setExternalHandlers(externalHandlers);
    })();
  }, [reload]);

  const handleFindState = useCallback<
    SourceHandlerContextProps["findHandler"]
  >(() => {
    // TODO implement
    return handlers[0] || null;
  }, [handlers]);

  const getById = useCallback<SourceHandlerContextProps["getById"]>(
    (id) => {
      return Object.freeze(handlers.find((h) => h.id === id) || null);
    },
    [handlers]
  );

  const save = useCallback<SourceHandlerContextProps["save"]>(
    (id, javascriptCode) => {
      const encodedJs = encodeURIComponent(javascriptCode);
      const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
      const handlerIndex = externalHandlers.findIndex((h) => h.id === id);

      const data = readExternalHandlers();
      if (handlerIndex >= 0) data[handlerIndex] = dataUri;
      else data.push(dataUri);

      writeExternalHandlers(data);
    },
    [externalHandlers]
  );

  const remove = useCallback<SourceHandlerContextProps["remove"]>(
    (id) => {
      const handlerIndex = externalHandlers.findIndex((h) => h.id === id);
      const data = readExternalHandlers();
      writeExternalHandlers(data.filter((_, i) => i !== handlerIndex));
    },
    [externalHandlers]
  );

  return (
    <SourceHandlerProviderContext.Provider
      value={{
        findHandler: handleFindState,
        builtIn: builtInHandlers,
        external: externalHandlers,
        getById,
        save,
        remove,
      }}
    >
      {children}
    </SourceHandlerProviderContext.Provider>
  );
}
