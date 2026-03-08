import { cn, generateId } from "@/lib/utils";
import { useSessionState } from "@daviapps/react-utils/hooks";
import { produce } from "immer";
// TmuxGrid.tsx
import React, {
  HTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { flattenTree } from "../lib";
import { AddDirection, FlatPane, FlatResizer, TreeNode } from "../types";

const initialTree: TreeNode = {
  type: "pane",
  id: "root",
  content: "",
};

export interface TmuxGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  renderItem: (props: {
    content: string;
    empty: boolean;
    list: FlatPane[];
    add: (direction: AddDirection, content: string) => void;
    set: (newContent: string) => void;
    swap: (content: string) => void;
    move: (direction: AddDirection, content: string) => void;
    remove: () => void;
  }) => ReactNode;
}

export const TmuxGrid: React.FC<TmuxGridProps> = ({
  renderItem,
  className,
  ...props
}) => {
  const [tree, setTree] = useSessionState<TreeNode>({
    key: "tmux-grid",
    initialState: initialTree,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para gerenciar o arrasto do resizer
  const draggingRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startRatio: number;
    splitW: number;
    splitH: number; // <-- NOVO
  } | null>(null);

  // Funções auxiliares (fora do componente ou antes do return)
  const getWeight = (node: any, dir: "V" | "H"): number => {
    if (node.type === "pane") return 1;
    if (node.direction === dir) {
      return getWeight(node.first, dir) + getWeight(node.second, dir);
    }
    return 1;
  };

  const equalizeTree = (node: any) => {
    if (node.type === "pane") return;
    equalizeTree(node.first);
    equalizeTree(node.second);
    const w1 = getWeight(node.first, node.direction);
    const w2 = getWeight(node.second, node.direction);
    node.ratio = w1 / (w1 + w2);
  };

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
      const newTree = structuredClone(currentTree);

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
    setTree((currentTree) => {
      // Regra de segurança: Não permitimos deletar se for o último painel
      if (currentTree.type === "pane") return currentTree;

      const newTree = structuredClone(currentTree);

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

  // --- LÓGICA DE REDIMENSIONAMENTO ---
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

    draggingRef.current = {
      id: resizer.id,
      startX: e.clientX,
      startY: e.clientY,
      startRatio,
      splitW: resizer.splitW, // <-- Salva a largura
      splitH: resizer.splitH, // <-- Salva a altura
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;

      const { id, startX, startY, startRatio, splitW, splitH } =
        draggingRef.current;
      const rect = containerRef.current.getBoundingClientRect();

      setTree(
        produce((draft) => {
          const updateRatio = (node: any) => {
            if (node.type === "split") {
              if (node.id === id) {
                if (node.direction === "V") {
                  const deltaX = e.clientX - startX;
                  const deltaGlobalRatio = deltaX / rect.width;
                  // Divide a delta global pela proporção do contêiner!
                  const deltaRatio = deltaGlobalRatio / (splitW / 100);
                  node.ratio = Math.max(
                    0.1,
                    Math.min(0.9, startRatio + deltaRatio),
                  );
                } else {
                  const deltaY = e.clientY - startY;
                  const deltaGlobalRatio = deltaY / rect.height;
                  // Divide a delta global pela proporção do contêiner!
                  const deltaRatio = deltaGlobalRatio / (splitH / 100);
                  node.ratio = Math.max(
                    0.1,
                    Math.min(0.9, startRatio + deltaRatio),
                  );
                }
              } else {
                updateRatio(node.first);
                updateRatio(node.second);
              }
            }
          };
          updateRatio(draft);
        }),
      );
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
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

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden relative", className)}
      {...props}
    >
      {/* RENDERIZAÇÃO DOS PAINÉIS (TILES) */}
      {panes.map((pane) => (
        <div
          key={pane.content}
          className="flex flex-col p-0 relative"
          style={{
            position: "absolute",
            left: `${pane.x}%`,
            top: `${pane.y}%`,
            width: `${pane.w}%`,
            height: `${pane.h}%`,
            // border: "1px solid ",
            boxSizing: "border-box",
            color: "white",
          }}
        >
          {renderItem({
            content: pane.content,
            empty: panes.filter((it) => it.content !== "").length === 0,
            list: panes,
            add: (direction, content) =>
              handleAddTile(pane.id, direction, content),
            set: (newContent: string) => handleUpdateTile(pane.id, newContent),
            swap: (content) => handleSwapNodesByContent(content, pane.content),
            move(direction, sourceContent) {
              const sourceId = panes.find(
                (it) => it.content === sourceContent,
              )?.id;
              if (!sourceId) return;
              handleMoveTile(sourceId, pane.id, direction);
            },
            remove: () => handleRemoveTile(pane.id),
          })}
        </div>
      ))}

      {/* RENDERIZAÇÃO DOS RESIZERS */}
      {resizers.map((resizer) => {
        const isV = resizer.direction === "V";
        return (
          <div
            key={`resizer-${resizer.id}`}
            onMouseDown={(e) => startDrag(e, resizer)} // <-- MUDE DE resizer.id PARA resizer
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
            }}
          />
        );
      })}
    </div>
  );
};
