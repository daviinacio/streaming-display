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

  // O set agora aceita um segundo parâmetro opcional
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

        if (resolvedPresent === currentHistory.present) return currentHistory;

        // Se overwrite for true, atualizamos o presente mas NÃO mexemos no passado
        if (options?.overwrite) {
          return {
            ...currentHistory,
            present: resolvedPresent,
            future: [], // Qualquer nova ação apaga o futuro (redo)
          };
        }

        // Comportamento normal: salva o estado anterior no passado
        return {
          past: [...currentHistory.past, currentHistory.present],
          present: resolvedPresent,
          future: [],
        };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) return currentHistory;

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

  return { state: history.present, set, undo, redo, history };
}
