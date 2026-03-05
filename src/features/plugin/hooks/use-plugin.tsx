import { transformStringToJsxComponent } from "@/features/plugin/components/DynamicComponent";
import { findWildcard, randomInteger } from "@/lib/utils";
import {
  createContext,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface PluginCommon {
  id: string;
  enabled: boolean;
  name: string;
  match: Array<string>;
}

export interface PluginRaw extends PluginCommon {
  components: Array<PluginRawComponent>;
}

export type PluginRawComponent = {
  name: string;
  type: string;
  code: string;
};

export interface Plugin extends PluginCommon {
  readonly: boolean;
  components: Array<PluginComponent>;
}

export type PluginComponent = {
  type: string;
  name: string;
  component: (props: any) => ReactNode;
};
// | {
//     type: "SourceHandler";
//     handler: (url: string) => any;
//   };

// export interface PluginComponent {
//   name: string;
//   type: PluginComponentType;
//   handler: (props: any) => ReactNode;
// }

// export type PluginComponentType = "SourceHandler" | "Player";

export interface PluginContextState {
  list: Array<Plugin>;
  save: (plugin: PluginRaw) => void;
  remove: (id: string) => void;
  findPluginRawById: (id: string) => PluginRaw | void;
  findPluginByUrl: (url: string) => Plugin | void;
  findPlayerByUrl: (url: string) => ((props: any) => React.ReactNode) | void;
}
const PluginContext = createContext<PluginContextState | null>(null);

export function usePlugin() {
  const context = useContext(PluginContext);
  if (!context) throw new Error("PluginProvider is required");
  return context;
}

const STORAGE_KEY = "plugins";

export function PluginProvider({ children }: PropsWithChildren) {
  const [reload, setReload] = useState(false);
  const [plugins, setPlugins] = useState<Array<Plugin>>([]);
  const [pluginsRaw, setPluginsRaw] = useState<Array<PluginRaw>>([]);

  // Storage

  const readFromStorage = useCallback(() => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
  }, []);

  const writeToStorage = useCallback((pluginList: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pluginList));
    setReload((p) => !p);
  }, []);

  // Actions

  const handleFindPluginByUrl = useCallback<
    PluginContextState["findPluginByUrl"]
  >(
    (url) => {
      return plugins.find((it) => it.enabled && findWildcard(it.match, url));
    },
    [plugins],
  );

  const handleFindPlayerByUrl = useCallback<
    PluginContextState["findPlayerByUrl"]
  >(
    (url) => {
      const plugin = handleFindPluginByUrl(url);
      if (!plugin) return undefined;
      const component = plugin.components.find((it) => it.type === "Player");
      if (!component) return undefined;
      return component.component;
    },
    [plugins],
  );

  const handleFindPluginRawById = useCallback<
    PluginContextState["findPluginRawById"]
  >((id) => pluginsRaw.find((it) => it.id === id), [pluginsRaw]);

  const handleSave = useCallback<PluginContextState["save"]>(
    (plugin) => {
      if (!plugin.id) plugin.id = String(randomInteger(200, 9999));

      const pluginIndex = plugins.findIndex((it) => it.id === plugin.id);
      const pluginJson = encodeURIComponent(
        `export default ${JSON.stringify(plugin)}`,
      );

      const data = readFromStorage();
      if (pluginIndex >= 0) data[pluginIndex] = pluginJson;
      else data.push(pluginJson);

      writeToStorage(data);
    },
    [plugins],
  );

  const handleRemove = useCallback<PluginContextState["remove"]>(
    (id) => {
      const pluginIndex = plugins.findIndex((p) => p.id === id);
      const data = readFromStorage();
      writeToStorage(data.filter((_, i) => i !== pluginIndex));
    },
    [plugins],
  );

  useEffect(() => {
    (async function () {
      // const builtinHandlers: SourceHandler[] = await Promise.all(
      //   Object.entries(
      //     import.meta.glob("/src/assets/builtin-source-handlers/*")
      //   ).map(([_, file]) => file().then((module: any) => module.default))
      // );

      const rawList = (await Promise.all(
        readFromStorage().map((source) => {
          const dataUri = `data:text/javascript;charset=utf-8,${source}`;
          return import(/* @vite-ignore */ dataUri).then(
            (module) => module.default,
          );
        }),
      )) as never as Array<PluginRaw>;

      async function convertPluginRaw(raw: PluginRaw): Promise<Plugin> {
        const plugin: Plugin = {
          id: raw.id,
          enabled: raw.enabled,
          match: raw.match,
          name: raw.name,
          readonly: false,
          components: [],
        };

        for (let i = 0; i < raw.components.length; i++) {
          const rawComponent = raw.components[i];
          // JSX components
          if (["Player"].includes(rawComponent.type)) {
            const component = await transformStringToJsxComponent(
              rawComponent.code,
            );

            plugin.components.push({
              name: rawComponent.name,
              type: rawComponent.type,
              component: component,
            });
          }
        }

        return plugin;
      }

      console.log("rawList", rawList);

      setPluginsRaw(rawList);

      Promise.all(rawList.map(convertPluginRaw)).then((it) => setPlugins(it));
    })();
  }, [reload]);

  return (
    <PluginContext.Provider
      value={{
        list: plugins,
        save: handleSave,
        remove: handleRemove,
        findPluginRawById: handleFindPluginRawById,
        findPlayerByUrl: handleFindPlayerByUrl,
        findPluginByUrl: handleFindPluginByUrl,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
}
