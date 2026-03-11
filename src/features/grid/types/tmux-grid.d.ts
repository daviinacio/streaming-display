export type SplitDirection = "V" | "H"; // V = Left/Right, H = Top/Bottom
export type AddDirection = "top" | "right" | "bottom" | "left";

export interface PaneNode {
  type: "pane";
  id: string;
  content: string;
}

export interface SplitNode {
  type: "split";
  id: string;
  direction: SplitDirection;
  ratio: number; // Ex: 0.5 (50% para cada lado)
  first: TreeNode;
  second: TreeNode;
}

export type TreeNode = PaneNode | SplitNode;

// Tipos para a renderização plana (DOM)
export interface FlatPane extends PaneNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlatResizer {
  id: string;
  direction: SplitDirection;
  x: number;
  y: number;
  w: number;
  h: number;
  splitW: number; // <-- NOVO: Largura do contêiner em %
  splitH: number; // <-- NOVO: Altura do contêiner em %
}

export interface GridItemActions {
  add: (direction: AddDirection, content: string) => void;
  set: (newContent: string) => void;
  swap: (content: string) => void;
  move: (direction: AddDirection, content: string) => void;
  remove: () => void;
  toggleMaximize: () => void;
  disableMaximize: () => void;
}
