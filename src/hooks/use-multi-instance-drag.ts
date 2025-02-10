import { useCallback, useEffect } from "react";

export type UseMultiInstanceDragProps = {
  onDrop: (url: string, swapUrl?: string) => boolean;
};

export type DragParams = {
  value: string;
  outOfPage: boolean;
};

export type DropParams = {
  value: string;
  swapUrl?: string;
};

export type DragState = {
  url?: string;
  outOfPage?: boolean;
  dropped?: boolean;
  swapUrl?: string;
};

const storageKey = "drop-n-drop";

function deserializeDragState(): DragState {
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data || "{}") : {};
}

function updateDragState(state: Partial<DragState>) {
  const prev = deserializeDragState();
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...prev,
      ...state,
    })
  );
}

export function useMultiInstanceDrag(props?: UseMultiInstanceDragProps) {
  const { onDrop } = props || {};

  const getDragState = useCallback(() => deserializeDragState(), []);

  useEffect(() => {
    function storageHandler(event: StorageEvent) {
      if (event.key === storageKey) {
        const { dropped, outOfPage, url, swapUrl } = getDragState();

        if (url && dropped && outOfPage) {
          onDrop && onDrop(url, swapUrl);
        }
      }
    }

    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, [onDrop, getDragState]);

  const handleNotifyDrag = useCallback((params: DragParams) => {
    updateDragState({
      url: params.value,
      outOfPage: params.outOfPage,
      dropped: false,
      swapUrl: undefined,
    });
  }, []);

  const handleNotifyDrop = useCallback(
    (params: DropParams) => {
      const state = getDragState();
      updateDragState({
        dropped: state.url === params.value,
        swapUrl: params.swapUrl,
      });
    },
    [getDragState]
  );

  return {
    notifyDrag: handleNotifyDrag,
    notifyDrop: handleNotifyDrop,
    getDragState,
  };
}
