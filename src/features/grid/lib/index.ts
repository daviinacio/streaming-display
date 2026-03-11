import { FlatPane, FlatResizer, TreeNode } from "../types/tmux-grid";

export function flattenTree(
  node: TreeNode,
  x = 0,
  y = 0,
  w = 100,
  h = 100,
  panes: FlatPane[] = [],
  resizers: FlatResizer[] = [],
) {
  if (node.type === "pane") {
    panes.push({ ...node, x, y, w, h });
  } else {
    if (node.direction === "V") {
      const leftW = w * node.ratio;
      const rightW = w * (1 - node.ratio);

      flattenTree(node.first, x, y, leftW, h, panes, resizers);
      // Adicionamos splitW e splitH aqui:
      resizers.push({
        id: node.id,
        direction: "V",
        x: x + leftW,
        y,
        w: 0,
        h,
        splitW: w,
        splitH: h,
      });
      flattenTree(node.second, x + leftW, y, rightW, h, panes, resizers);
    } else {
      const topH = h * node.ratio;
      const bottomH = h * (1 - node.ratio);

      flattenTree(node.first, x, y, w, topH, panes, resizers);
      // Adicionamos splitW e splitH aqui:
      resizers.push({
        id: node.id,
        direction: "H",
        x,
        y: y + topH,
        w,
        h: 0,
        splitW: w,
        splitH: h,
      });
      flattenTree(node.second, x, y + topH, w, bottomH, panes, resizers);
    }
  }
  return { panes, resizers };
}
