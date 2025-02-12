import { useCallback, useContext, useMemo } from "react";
import { TemporaryStateContext } from "@/providers/temporary-state-provider";

export type UseTemporaryStateDispatchFn<T> = (prev: T) => T;
export type UseTemporaryStateDispatch<T> = (
  value: T | UseTemporaryStateDispatchFn<T>
) => void;
export type UseTemporaryStateResult<T> = [T, UseTemporaryStateDispatch<T>];

export type UseTemporaryStateType<T> = (
  key: string,
  defaultValue?: T
) => UseTemporaryStateResult<T>;

export function useTemporaryState<T>(
  key: string,
  defaultValue?: T
): UseTemporaryStateResult<T> {
  const context = useContext(TemporaryStateContext);
  if (context === undefined)
    throw new Error(
      "useTemporaryState must be used within a TemporaryStateProvider"
    );

  const defaultData = useMemo(() => defaultValue, []);

  const value = useMemo(
    () => (context.getItem(key) ?? defaultData ?? undefined) as T,
    [context.getItem]
  );
  const dispatch = useCallback<UseTemporaryStateDispatch<T>>(
    (setter) => {
      setTimeout(() => context.setItem(key, setter, defaultValue));
    },
    [context.setItem, key]
  );

  return [value, dispatch];
}
