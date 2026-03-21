import { useSessionState } from "@daviapps/react-utils/hooks";
import { useCallback, useState } from "react";

export function useUndoableState<T>(initialValue: T, sessionStateKey?: string) {
  const initialState = {
    past: [] as T[],
    present: initialValue,
    future: [] as T[],
  };

  const [history, setHistory] = sessionStateKey
    ? useSessionState({
        key: sessionStateKey,
        initialState,
      })
    : useState(initialState);

  const set = useCallback(
    (
      newPresent: T | ((current: T) => T),
      options?: { overwrite?: boolean },
    ) => {
      setHistory((currentHistory) => {
        const resolvedPresent =
          typeof newPresent === "function"
            ? (newPresent as Function)(currentHistory.present)
            : newPresent;

        // Checa se a referência mudou (se for a mesma, o React/Immer acha que nada mudou)
        if (resolvedPresent === currentHistory.present) {
          console.groupEnd();
          return currentHistory;
        }

        if (options?.overwrite) {
          console.groupEnd();
          return {
            ...currentHistory,
            present: resolvedPresent,
            future: [],
          };
        }

        return {
          past: [...currentHistory.past, currentHistory.present],
          present: resolvedPresent,
          future: [],
        };
      });
    },
    [setHistory],
  );

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) {
        return currentHistory;
      }

      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(
        0,
        currentHistory.past.length - 1,
      );

      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) return currentHistory;

      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return { state: history.present, set, undo, redo, history, reset };
}
