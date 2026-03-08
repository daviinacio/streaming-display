import { distinct, findWildcard } from "@/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { parsePluginComponent } from "../lib/parse-plugin-component";
import { Plugin, PluginComponent, PluginRaw } from "../types";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";

export interface PluginContextState {
  list: Array<Plugin>;
  save: (plugin: PluginRaw) => void;
  remove: (id: string) => void;
  updatePluginEnabled: (id: string, enabled: boolean) => void;
  findPluginRawById: (id: string) => PluginRaw | undefined;
  findPluginByUrl: (url: string) => Plugin[];
  findComponentByUrl: (
    url: string,
    type: PLUGIN_TYPE_OPTIONS,
  ) => PluginComponent["component"][];
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

  const savePluginsRaw = useCallback(() => {
    const data = pluginsRaw
      .map((it) => {
        if (!it.id) it.id = String(new Date().getTime());
        return it;
      })
      .filter((it) => !it.isBuiltin)
      .filter(distinct("id"))
      .map((it) => encodeURIComponent(`export default ${JSON.stringify(it)}`));

    writeToStorage(data);
  }, [pluginsRaw]);

  // Actions

  const handleFindPluginByUrl = useCallback<
    PluginContextState["findPluginByUrl"]
  >(
    (url) => {
      return plugins
        .toSorted((a, b) => (a.isBuiltin !== b.isBuiltin ? 0 : 1))
        .filter((it) => it.enabled && findWildcard(it.match, url));
    },
    [plugins],
  );

  const handleFindComponentByUrl = useCallback<
    PluginContextState["findComponentByUrl"]
  >(
    (url, type) => {
      return handleFindPluginByUrl(url).reduce(
        (acc, plugin) => {
          const components = plugin.components
            .filter((it) => it.type === type && it.enabled)
            .map((it) => it.component);
          return [...acc, ...components];
        },
        [] as PluginComponent["component"][],
      );
    },
    [plugins],
  );

  const handleFindPluginRawById = useCallback<
    PluginContextState["findPluginRawById"]
  >(
    (id) =>
      pluginsRaw
        .toSorted((a, b) => (a.isBuiltin !== b.isBuiltin ? 0 : 1))
        .find((it) => it.id === id),
    [pluginsRaw],
  );

  const handleSave = useCallback<PluginContextState["save"]>(
    (plugin) => {
      const pluginIndex = pluginsRaw.findIndex((it) => it.id === plugin.id);
      if (pluginIndex === -1) pluginsRaw.push(plugin);
      else pluginsRaw[pluginIndex] = plugin;
      savePluginsRaw();
    },
    [pluginsRaw, savePluginsRaw],
  );

  const handleRemove = useCallback<PluginContextState["remove"]>(
    (id) => {
      // console.log(23);
      const pluginIndex = pluginsRaw.findIndex(
        (p) => p.id === id && !p.isBuiltin,
      );
      delete pluginsRaw[pluginIndex];
      savePluginsRaw();
    },
    [plugins],
  );

  const handleUpdatePluginEnabled = useCallback<
    PluginContextState["updatePluginEnabled"]
  >(
    (id, enabled) => {
      const plugin = pluginsRaw.find((it) => it.id === id && !it.isBuiltin);
      if (!plugin) return;
      plugin.enabled = enabled;
      savePluginsRaw();
    },
    [pluginsRaw],
  );

  useEffect(() => {
    (async function () {
      const builtinPluginRaws: PluginRaw[] = await Promise.all(
        Object.entries(import.meta.glob("/src/assets/builtin-plugins/*")).map(
          ([_, file]) => file().then((module: any) => module.default),
        ),
      );

      const customPluginRaws = (await Promise.all(
        readFromStorage().map((source) => {
          const dataUri = `data:text/javascript;charset=utf-8,${source}`;
          return import(/* @vite-ignore */ dataUri).then(
            (module) => module.default,
          );
        }),
      )) as never as Array<PluginRaw>;

      async function convertPluginRaw(raw: PluginRaw): Promise<Plugin> {
        const plugin: Plugin = {
          isBuiltin: raw.isBuiltin,
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
          // if (["player"].includes(rawComponent.type)) {
          const component = await parsePluginComponent(rawComponent.code);

          plugin.components.push({
            enabled: rawComponent.enabled,
            name: rawComponent.name,
            type: rawComponent.type,
            component: component,
          });
          // }
        }

        return plugin;
      }

      builtinPluginRaws.forEach((it) => (it.isBuiltin = true));
      customPluginRaws.forEach((it) => (it.isBuiltin = false));

      const pluginRaws = [...builtinPluginRaws, ...customPluginRaws];

      setPluginsRaw(pluginRaws);

      Promise.all(pluginRaws.map(convertPluginRaw)).then((it) =>
        setPlugins(it),
      );
    })();
  }, [reload]);

  return (
    <PluginContext.Provider
      value={{
        list: plugins,
        save: handleSave,
        remove: handleRemove,
        updatePluginEnabled: handleUpdatePluginEnabled,
        findPluginRawById: handleFindPluginRawById,
        findComponentByUrl: handleFindComponentByUrl,
        findPluginByUrl: handleFindPluginByUrl,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
}
