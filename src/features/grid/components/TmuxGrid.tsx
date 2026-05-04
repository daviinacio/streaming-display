import { cn, generateId } from "@/lib/utils";
import { produce } from "immer";
// TmuxGrid.tsx
import { useUndoableState } from "@/hooks/use-undoable-state";
import { useHotkey } from "@tanstack/react-hotkeys";
import React, {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { equalizeTree, flattenTree } from "../lib";
import {
  AddDirection,
  FlatPane,
  FlatResizer,
  GridItemActions,
  SplitDirection,
  TreeNode,
} from "../types/tmux-grid";

export const fallbackInitialTree: TreeNode = {
  type: "pane",
  id: "root",
  content: "",
};
export const cloneTree = (node: any): any => {
  if (node.type === "pane") {
    return { ...node }; // Copia rasa do painel (preserva JSX, Strings, URLs)
  }
  return {
    ...node,
    first: cloneTree(node.first),
    second: cloneTree(node.second),
  };
};

export interface TmuxGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  renderItem: (props: {
    content: string;
    empty: boolean;
    list: FlatPane[];
    actions: GridItemActions;
  }) => ReactNode;
  initialTree?: TreeNode;
  sessionStateKey?: string;
}

export interface TmuxGridHandle {
  removeByContent: (content: string) => void;
  replaceByContent: (oldContent: string, newContent: string) => void;
  getTree: () => TreeNode;
}

export const TmuxGrid = forwardRef<TmuxGridHandle, TmuxGridProps>(({
  renderItem,
  className,
  initialTree,
  sessionStateKey = "tmux-grid",
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(true);
  const [maximizedPaneId, setMaximizedPaneId] = useState<string | null>(null);

  const {
    state: tree,
    set: setTree,
    undo,
    redo,
  } = useUndoableState<TreeNode>(
    initialTree || fallbackInitialTree,
    sessionStateKey,
  );

  useHotkey("Mod+Z", undo);
  useHotkey("Mod+Shift+Z", redo);

  // Estado para gerenciar o arrasto do resizer
  const draggingRef = useRef<{
    id: string;
    direction: SplitDirection;
    startX: number;
    startY: number;
    startRatio: number;
    splitW: number;
    splitH: number;
    initialPos: number; // NOVO: Posição absoluta inicial do resizer (em %)
    parentStart: number; // NOVO: Onde o contêiner pai começa (em %)
    snapLines: number[]; // NOVO: Array de coordenadas magnéticas
    hasMoved: boolean;
  } | null>(null);

  // Dentro do componente TmuxGrid
  const handleResetHandles = () => {
    setTree((currentTree) => {
      return produce(currentTree, (draft) => {
        equalizeTree(draft);
      });
    });
  };

  // --- LÓGICA DE ADICIONAR TILE ---
  const handleAddTile = (
    targetId: string,
    direction: AddDirection,
    content: string,
  ) => {
    setTree((currentTree) => {
      return produce(currentTree, (draft) => {
        // Função recursiva para encontrar o alvo e criar o Split
        const splitNode = (node: any): boolean => {
          if (node.type === "pane" && node.id === targetId) {
            // 1. Cria o novo painel e guarda uma cópia do atual
            const newNode = { type: "pane", id: generateId(), content };
            const oldPane = { ...node };

            const isVert = direction === "left" || direction === "right";
            const isFirst = direction === "left" || direction === "top";

            // 2. Transforma o nó atual em um SplitNode
            node.type = "split";
            node.id = generateId();
            node.direction = isVert ? "V" : "H";

            // 3. Divide APENAS o espaço deste contêiner pela metade (50/50)
            node.ratio = 0.5;

            node.first = isFirst ? newNode : oldPane;
            node.second = isFirst ? oldPane : newNode;
            delete node.content; // Limpa o conteúdo pois agora ele é um contêiner

            return true;
          }
          if (node.type === "split") {
            return splitNode(node.first) || splitNode(node.second);
          }
          return false;
        };

        // Executa a divisão e NÃO chama o equalizeTree()
        splitNode(draft);
      });
    });
  };

  const handleSwapNodesByContent = (content1: string, content2: string) => {
    const id1 = panes.find((it) => it.content === content1)?.id;
    const id2 = panes.find((it) => it.content === content2)?.id;
    if (!id1 || !id2) return;
    handleSwapNodes(id1, id2);
  };

  const handleRemoveTileByContent = (content: string) => {
    const targetId = panes.find((it) => it.content === content)?.id;
    if (!targetId) return;
    // handleRemoveTile is a no-op when the tree is a single pane (the root
    // can't be deleted). Mirror the per-pane action: clear content instead.
    if (panes.length === 1) {
      handleUpdateTile(targetId, "");
      return;
    }
    handleRemoveTile(targetId);
  };

  const handleReplaceTileByContent = (
    oldContent: string,
    newContent: string,
  ) => {
    const targetId = panes.find((it) => it.content === oldContent)?.id;
    if (!targetId) return;
    handleUpdateTile(targetId, newContent);
  };

  // --- LÓGICA DE TROCA (SWAP) ---
  const handleSwapNodes = (id1: string, id2: string) => {
    if (id1 === id2) return;

    setTree((currentTree) => {
      return produce(currentTree, (draft) => {
        let parent1: any = null;
        let key1: "first" | "second" | null = null;

        let parent2: any = null;
        let key2: "first" | "second" | null = null;

        // Função para encontrar os pais e as chaves ('first' ou 'second') dos nós
        const findParents = (
          node: any,
          parent: any,
          key: "first" | "second" | null,
        ) => {
          if (node.type === "pane") {
            if (node.id === id1) {
              parent1 = parent;
              key1 = key;
            }
            if (node.id === id2) {
              parent2 = parent;
              key2 = key;
            }
          } else if (node.type === "split") {
            findParents(node.first, node, "first");
            findParents(node.second, node, "second");
          }
        };

        // Se a raiz for um painel único, não há o que trocar
        if (draft.type === "pane") return;

        // Inicia a busca a partir dos filhos da raiz
        findParents(draft.first, draft, "first");
        findParents(draft.second, draft, "second");

        // Se encontrou os dois nós e eles têm pais (ou seja, não são a raiz)
        if (parent1 && key1 && parent2 && key2) {
          // Guarda a referência original do draft
          const tempNode1 = parent1[key1];
          const tempNode2 = parent2[key2];

          // Realiza a troca
          parent1[key1] = tempNode2;
          parent2[key2] = tempNode1;
        }
      });
    });
  };

  // --- LÓGICA DE MOVER TILE (RELATIVA A OUTRO TILE) ---
  const handleMoveTile = (
    sourceId: string,
    targetId: string,
    direction: AddDirection,
  ) => {
    // 1. Evita mover um painel para o lado dele mesmo
    if (sourceId === targetId) return;

    setTree((currentTree) => {
      // 2. Se a tela só tem 1 painel (o root), não há para onde mover
      if (currentTree.type === "pane") return currentTree;

      // FUGA DO IMMER: Usamos um clone profundo para evitar conflitos de Proxy.
      // (Nota: Se o seu ambiente Vite reclamar do structuredClone, use JSON.parse(JSON.stringify(currentTree)))
      const newTree = cloneTree(currentTree);

      // FASE 1: Encontrar e fazer uma cópia do painel de origem
      let sourcePaneData: any = null;
      const findSource = (node: any) => {
        if (node.type === "pane" && node.id === sourceId) {
          sourcePaneData = { ...node };
        } else if (node.type === "split") {
          findSource(node.first);
          findSource(node.second);
        }
      };
      findSource(newTree);

      // Se não achou o painel de origem, aborta
      if (!sourcePaneData) return currentTree;

      // FASE 2: Remover o painel de origem
      const removeNode = (node: any): any => {
        if (node.type === "pane") {
          if (node.id === sourceId) return null;
          return node;
        }
        if (node.type === "split") {
          const firstResult = removeNode(node.first);
          const secondResult = removeNode(node.second);

          if (firstResult === null) return secondResult;
          if (secondResult === null) return firstResult;

          node.first = firstResult;
          node.second = secondResult;
          return node;
        }
      };

      const healedTree = removeNode(newTree);
      if (!healedTree) return currentTree;

      // FASE 3: Inserir a cópia do painel na posição do destino
      const insertNode = (node: any): boolean => {
        if (node.type === "pane" && node.id === targetId) {
          const oldPane = { ...node };
          const isVert = direction === "left" || direction === "right";
          const isFirst = direction === "left" || direction === "top";

          node.type = "split";
          node.id = generateId();
          node.direction = isVert ? "V" : "H";
          node.ratio = 0.5;

          node.first = isFirst ? sourcePaneData : oldPane;
          node.second = isFirst ? oldPane : sourcePaneData;
          delete node.content;

          return true;
        }
        if (node.type === "split") {
          return insertNode(node.first) || insertNode(node.second);
        }
        return false;
      };

      insertNode(healedTree);
      return healedTree; // Retornamos o clone modificado para o React
    });
  };

  // --- LÓGICA DE REMOVER (FECHAR) TILE ---
  const handleRemoveTile = (targetId: string) => {
    if (maximizedPaneId === targetId) {
      setMaximizedPaneId(null);
    }

    setTree((currentTree) => {
      // Regra de segurança: Não permitimos deletar se for o último painel
      if (currentTree.type === "pane") return currentTree;

      const newTree = cloneTree(currentTree);

      const removeNode = (node: any): any => {
        if (node.type === "pane") {
          if (node.id === targetId) return null;
          return node;
        }

        if (node.type === "split") {
          const firstResult = removeNode(node.first);
          const secondResult = removeNode(node.second);

          // Se um filho foi deletado, o contêiner morre e dá lugar ao sobrevivente
          if (firstResult === null) return secondResult;
          if (secondResult === null) return firstResult;

          node.first = firstResult;
          node.second = secondResult;
          return node;
        }
      };

      return removeNode(newTree) || currentTree;
    });
  };

  // --- LÓGICA DE ATUALIZAR CONTEÚDO DO TILE ---
  const handleUpdateTile = (targetId: string, newContent: string) => {
    setTree((currentTree) => {
      return produce(currentTree, (draft) => {
        // Função recursiva para encontrar o alvo e atualizar
        const updateNode = (node: any): boolean => {
          if (node.type === "pane" && node.id === targetId) {
            node.content = newContent; // Atualiza o valor diretamente
            return true; // Para a busca
          }
          if (node.type === "split") {
            // Continua buscando nos filhos
            return updateNode(node.first) || updateNode(node.second);
          }
          return false;
        };

        updateNode(draft);
      });
    });
  };

  // --- LÓGICA DE INICIAR O ARRASTO ---
  const startDrag = (e: React.MouseEvent, resizer: FlatResizer) => {
    let startRatio = 0.5;
    const findRatio = (node: TreeNode) => {
      if (node.type === "split") {
        if (node.id === resizer.id) startRatio = node.ratio;
        else {
          findRatio(node.first);
          findRatio(node.second);
        }
      }
    };
    findRatio(tree);

    const isV = resizer.direction === "V";

    // 1. Coleta as coordenadas de TODOS os outros resizers na mesma direção
    const snapLines = resizers
      .filter((r) => r.id !== resizer.id && r.direction === resizer.direction)
      .map((r) => (isV ? r.x : r.y));

    // BÔNUS: Adiciona uma força magnética invisível exatamente no centro da tela (50%)!
    // Isso ajuda o usuário a voltar os painéis para o meio perfeito sem precisar do botão de reset.
    snapLines.push(50);

    // 2. Calcula onde o contêiner "pai" deste resizer começa na tela
    const parentStart = isV
      ? resizer.x - startRatio * resizer.splitW
      : resizer.y - startRatio * resizer.splitH;

    draggingRef.current = {
      id: resizer.id,
      direction: resizer.direction,
      startX: e.clientX,
      startY: e.clientY,
      startRatio,
      splitW: resizer.splitW,
      splitH: resizer.splitH,
      initialPos: isV ? resizer.x : resizer.y,
      parentStart,
      snapLines,
      hasMoved: false,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      setAnimate(false);

      const {
        id,
        direction,
        startX,
        startY,
        splitW,
        splitH,
        initialPos,
        parentStart,
        snapLines,
      } = draggingRef.current;

      const rect = containerRef.current.getBoundingClientRect();

      // FORÇA DO ÍMÃ: Se o mouse chegar a 1.5% de distância de outra linha, ele gruda!
      const SNAP_THRESHOLD = 1.5;

      setTree(
        produce((draft) => {
          const updateRatio = (node: any) => {
            if (node.type === "split") {
              if (node.id === id) {
                let newRatio = 0.5;

                if (direction === "V") {
                  // Converte o movimento de pixels para porcentagem global
                  const deltaX_pct = ((e.clientX - startX) / rect.width) * 100;
                  let proposedX = initialPos + deltaX_pct;

                  // APLICA O MAGNETISMO
                  for (const line of snapLines) {
                    if (Math.abs(proposedX - line) < SNAP_THRESHOLD) {
                      proposedX = line; // GRUDOU!
                      break;
                    }
                  }

                  // Converte a coordenada global de volta para a proporção local (ratio) do contêiner
                  newRatio = (proposedX - parentStart) / splitW;
                } else {
                  // Mesma lógica para a vertical (linhas horizontais)
                  const deltaY_pct = ((e.clientY - startY) / rect.height) * 100;
                  let proposedY = initialPos + deltaY_pct;

                  for (const line of snapLines) {
                    if (Math.abs(proposedY - line) < SNAP_THRESHOLD) {
                      proposedY = line; // GRUDOU!
                      break;
                    }
                  }

                  newRatio = (proposedY - parentStart) / splitH;
                }

                // Trava entre 0.05 e 0.95 para o painel não sumir (5% mínimo)
                node.ratio = Math.max(0.05, Math.min(0.95, newRatio));
              } else {
                updateRatio(node.first);
                updateRatio(node.second);
              }
            }
          };
          updateRatio(draft);
        }),
        { overwrite: draggingRef.current.hasMoved },
      );
      draggingRef.current.hasMoved = true;
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
      setAnimate(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // --- RENDERIZAÇÃO ---
  const { panes, resizers } = useMemo(() => {
    const flattened = flattenTree(tree);
    flattened.panes.sort((a, b) => a.id.localeCompare(b.id));

    return flattened;
  }, [tree]);

  useImperativeHandle(ref, () => ({
    removeByContent: handleRemoveTileByContent,
    replaceByContent: handleReplaceTileByContent,
    getTree: () => tree,
  }));

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden relative", className)}
      {...props}
    >
      {/* RENDERIZAÇÃO DOS PAINÉIS (TILES) */}
      {panes.map((pane) => {
        const isMaximized = maximizedPaneId === pane.id;
        const isHidden = maximizedPaneId !== null && !isMaximized;

        return (
          <div
            key={pane.content}
            className={cn(
              "flex flex-col p-0 relative ",
              animate && "transition-all duration-300",
            )}
            style={{
              position: "absolute",
              left: isMaximized ? "0%" : `${pane.x}%`,
              top: isMaximized ? "0%" : `${pane.y}%`,
              width: isMaximized ? "100%" : `${pane.w}%`,
              height: isMaximized ? "100%" : `${pane.h}%`,
              zIndex: isMaximized ? 50 : undefined,

              opacity: isHidden ? 0 : 1,
              pointerEvents: isHidden ? "none" : "auto",
              // border: "1px solid ",
              boxSizing: "border-box",
              color: "white",
            }}
          >
            {renderItem({
              content: pane.content,
              empty: panes.filter((it) => it.content !== "").length === 0,
              list: panes,
              actions: {
                add: (direction, content) =>
                  handleAddTile(pane.id, direction, content),
                set: (newContent: string) =>
                  handleUpdateTile(pane.id, newContent),
                swap: (content) =>
                  handleSwapNodesByContent(content, pane.content),
                move(direction, sourceContent) {
                  const sourceId = panes.find(
                    (it) => it.content === sourceContent,
                  )?.id;
                  if (!sourceId) return;
                  handleMoveTile(sourceId, pane.id, direction);
                },
                remove: () => {
                  if (panes.length === 1) return handleUpdateTile(pane.id, "");
                  handleRemoveTile(pane.id);
                },
                toggleMaximize() {
                  if (maximizedPaneId === pane.id) setMaximizedPaneId(null);
                  else setMaximizedPaneId(pane.id);
                },
                disableMaximize() {
                  setMaximizedPaneId(null);
                },
              },
            })}
          </div>
        );
      })}

      {/* RENDERIZAÇÃO DOS RESIZERS */}
      {resizers.map((resizer) => {
        const isV = resizer.direction === "V";
        return (
          <div
            key={`resizer-${resizer.id}`}
            onMouseDown={(e) => startDrag(e, resizer)}
            onDoubleClick={handleResetHandles}
            className="absolute active:bg-primary/70 transition-colors"
            style={{
              left: `${resizer.x}%`,
              top: `${resizer.y}%`,
              width: isV ? "8px" : `${resizer.w}%`,
              height: isV ? `${resizer.h}%` : "8px",
              transform: isV ? "translateX(-50%)" : "translateY(-50%)",
              cursor: isV ? "col-resize" : "row-resize",
              zIndex: 10,
              display: maximizedPaneId !== null ? "none" : "block",
            }}
          />
        );
      })}
    </div>
  );
});
