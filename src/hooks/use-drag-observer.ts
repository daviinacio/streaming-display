import { useEffect } from "react";

export type ItemDragProps = {
  outOfPage: boolean;
  value: string;
};

export type ItemDropProps = {
  dropped?: boolean;
  replace?: string;
};

export type useDragObserverProps = {
  onDropInOtherInstance?: (value: string) => void;
  onSwapWithOtherInstance?: (value1: string, value2: string) => void;
}

export function useDragObserver({
  onDropInOtherInstance,
  onSwapWithOtherInstance
}: useDragObserverProps){
  useEffect(() => {
    function storageHandler(event: StorageEvent) {
      if (event.key === "drag-element") {
        const { dropped, outOfPage, value, replace } = deserializeItemDragProps(event.newValue);

        if(dropped && outOfPage && replace){
          onSwapWithOtherInstance && onSwapWithOtherInstance(
            replace, value
          )
        }
        else if (dropped && outOfPage) {
          onDropInOtherInstance && onDropInOtherInstance(value);
        }
      }
    }

    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, [onDropInOtherInstance, onSwapWithOtherInstance]);
}

function deserializeItemDragProps(json: string | null): ItemDragProps & ItemDropProps {
  const empty : ItemDragProps & ItemDropProps= {
    outOfPage: false,
    value: ''
  }

  try {
    return JSON.parse(
      String(json) || '""'
    ) || empty;
  } catch (_) {}

  return {} as ItemDragProps & ItemDropProps;
}

export function getDraggingState(): ItemDragProps & ItemDropProps {
  return deserializeItemDragProps(
    localStorage.getItem('drag-element')
  )
}

export function clearDraggingState(){
  localStorage.removeItem("drag-element");
}


export function notifyItemDrag(data: ItemDragProps) {
  localStorage.setItem("drag-element", JSON.stringify(data));
}

export function notifyItemDrop(data: ItemDropProps){
  localStorage.setItem("drag-element", JSON.stringify({
    ...getDraggingState(),
    ...data
  }));
}
