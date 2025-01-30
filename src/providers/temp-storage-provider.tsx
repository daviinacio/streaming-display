import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

type SearchText = `search-text-${string}`;

export type TempItem = Record<string, any>;

const defaultTempItem: TempItem = {};

const storageKey = "temp";

export interface TempStorageContextProps {
  setItem: <K extends keyof TempItem>(
    key: K | SearchText,
    value: TempItem[K]
  ) => void;
  getItem: <K extends keyof TempItem>(key: K | SearchText) => TempItem[K];
  resetItem: <K extends keyof TempItem>(key: K) => void;
  clear: () => void;

  getItemsBySuffix: (suffix: string) => Partial<TempItem>;
  getItemsByPrefix: (suffix: string) => Partial<TempItem>;

  isItemEmpty: <K extends keyof TempItem>(key: K) => boolean;
}

export const TempStorageContext = createContext<
  TempStorageContextProps | undefined
>(undefined);

function deserializeTempItem(): TempItem {
  const data = sessionStorage.getItem(storageKey);
  return data ? JSON.parse(data) : defaultTempItem;
}

export function TempStorageProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<TempItem>(deserializeTempItem());

  useEffect(() => {
    if (!data) return;
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const setItem = useCallback<TempStorageContextProps["setItem"]>(
    (key, value) =>
      setData({
        ...defaultTempItem,
        ...data,
        [key]: value,
      }),
    [data]
  );

  const getItem = useCallback<TempStorageContextProps["getItem"]>(
    (key) => data[key as keyof TempItem] ?? "",
    [data]
  );

  const resetItem = useCallback<TempStorageContextProps["resetItem"]>(
    (key) => setItem(key, defaultTempItem[key as keyof TempItem]),
    [data]
  );

  const clear = useCallback<TempStorageContextProps["clear"]>(
    () => setData(defaultTempItem),
    [data]
  );

  const getItemsBySuffix = useCallback<
    TempStorageContextProps["getItemsBySuffix"]
  >(
    (suffix) =>
      (Object.keys(data) as Array<keyof typeof data>).reduce((acc, key) => {
        if (key.endsWith(suffix)) acc[key] = data[key];
        return acc;
      }, {} as Partial<TempItem>),
    [data]
  );

  const getItemsByPrefix = useCallback<
    TempStorageContextProps["getItemsByPrefix"]
  >(
    (prefix) =>
      (Object.keys(data) as Array<keyof typeof data>).reduce((acc, key) => {
        if (key.startsWith(prefix)) acc[key] = data[key];
        return acc;
      }, {} as Partial<TempItem>),
    [data]
  );

  const isItemEmpty = useCallback<TempStorageContextProps["isItemEmpty"]>(
    (key) => data[key] === defaultTempItem[key],
    [data]
  );

  return (
    <TempStorageContext.Provider
      value={{
        setItem,
        getItem,
        resetItem,
        clear,
        getItemsBySuffix,
        getItemsByPrefix,
        isItemEmpty,
      }}
    >
      {children}
    </TempStorageContext.Provider>
  );
}
