import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

const storageKey = "temp-state";

const defaultTempItem = {};

export interface TemporaryStateContextProps {
  setItem: (
    key: string,
    value: any | ((prev: any) => any),
    fallback: any
  ) => void;
  getItem: (key: string) => any;
  clear: () => void;

  getItemsBySuffix: (suffix: string) => any;
  getItemsByPrefix: (suffix: string) => any;
}

export const TemporaryStateContext = createContext<
  TemporaryStateContextProps | undefined
>(undefined);

function deserializeTempItem(): any {
  const data = sessionStorage.getItem(storageKey);
  return data ? JSON.parse(data) : defaultTempItem;
}

export function TemporaryStateProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<{ [key: string]: any }>(
    deserializeTempItem()
  );

  useEffect(() => {
    if (!data) return;
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const setItem = useCallback<TemporaryStateContextProps["setItem"]>(
    (key, setter, fallback) =>
      setData((data) => {
        const newValue =
          (typeof setter === "function"
            ? setter(data[key] ?? fallback)
            : setter) ?? fallback;

        return {
          ...data,
          [key]: newValue,
        };
      }),
    []
  );

  const getItem = useCallback<TemporaryStateContextProps["getItem"]>(
    (key: string) => data[key] ?? "",
    [data]
  );

  const clear = useCallback<TemporaryStateContextProps["clear"]>(
    () => setData(defaultTempItem),
    []
  );

  const getItemsBySuffix = useCallback<
    TemporaryStateContextProps["getItemsBySuffix"]
  >(
    (suffix) =>
      Object.entries(data).reduce((acc, [key, value]) => {
        if (key.endsWith(suffix)) acc[key] = value;
        return acc;
      }, {} as any),
    [data]
  );

  const getItemsByPrefix = useCallback<
    TemporaryStateContextProps["getItemsByPrefix"]
  >(
    (prefix) =>
      Object.entries(data).reduce((acc, [key, value]) => {
        if (key.startsWith(prefix)) acc[key] = value;
        return acc;
      }, {} as any),
    [data]
  );

  return (
    <TemporaryStateContext.Provider
      value={{
        setItem,
        getItem,
        clear,
        getItemsBySuffix,
        getItemsByPrefix,
      }}
    >
      {children}
    </TemporaryStateContext.Provider>
  );
}
