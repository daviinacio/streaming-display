# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Streaming Display v2 — a React + Vite SPA that centralizes multiple live streams into one resizable, draggable grid. Each stream URL is matched and rendered by a **plugin** (built-in or user-authored, hot-loaded from localStorage).

## Commands

Yarn (the lockfile is `yarn.lock`) on Node 24 (`.nvmrc`).

- `yarn dev` — Vite dev server, bound to `0.0.0.0` (so other devices on the LAN can connect).
- `yarn build` — `tsc -b && vite build` (production bundle into `dist/`).
- `yarn lint` — flat-config ESLint over the repo.
- `yarn preview` — serve the production build.

There is no test runner configured — do not invent one. The Dockerfile produces a static nginx image from `dist/`.

## Architecture

### Entry & routing

`src/main.tsx` mounts `<Providers><AppRouter/></Providers>`. The router is intentionally trivial: every path renders [GridView](src/pages/GridView.tsx). The trailing `*` slug is treated as a **deep link** of the form `pluginName:streamA,streamB/pluginName2:streamC` — `GridView` parses it, looks up plugins by name, expands each `streamX` against the plugin's `match[0]` wildcard, and seeds the initial split tree.

### Provider stack ([src/providers/index.tsx](src/providers/index.tsx))

Order is load-bearing — outer providers are dependencies of inner ones:

```
SessionStateProvider → LocalStateProvider → SourceHandlerProvider (legacy)
  → ThemeProvider → AlertDialogProvider → ReactQueryProvider
  → HotkeysProvider → PluginProvider → children + Toaster
```

`SourceHandlerProvider` is the **legacy** subsystem the plugin system replaces — see TODO.md "Plugins" backlog. New work belongs in `features/plugin`, not `providers/source-handler-provider.tsx`.

### Feature modules

Each feature in `src/features/<name>/` follows the same shape: `components/`, `hooks/`, `lib/`, `types/`, and an `index.ts` barrel (plus `constants/` and `validation/` where relevant — `validation/` holds zod schemas). Import from the barrel (`@/features/plugin`), not deep paths, when consuming from outside the feature.

- **`features/grid`** — [TmuxGrid](src/features/grid/components/TmuxGrid.tsx). The grid is a binary tree of `SplitNode`/`PaneNode` ([tmux-grid.d.ts](src/features/grid/types/tmux-grid.d.ts)). The tree is flattened to absolute coordinates each render (`flattenTree`/`equalizeTree` in [grid/lib](src/features/grid/lib/index.ts)). State is managed by `useUndoableState` (Mod+Z / Mod+Shift+Z via `@tanstack/react-hotkeys`). `GridItemActions` (add/set/swap/move/remove/toggleMaximize) is the contract handed to each rendered pane.
- **`features/stream`** — [Stream](src/features/stream/components/Stream.tsx) wraps a single URL. It runs a React Query keyed by `["handler", url]` that calls **every** matching `source_handler` plugin in parallel and merges defined fields (via `mergeDefined`) — later handlers override earlier ones for fields they actually return. The result feeds `<PluginMount position="player" fallback={<Player>}>`. `<StreamProvider>` exposes `refresh`, `error`, `handler`, and the parent `GridItemActions` to nested plugin components.
- **`features/plugin`** — see next section.
- **`features/preferences`** — theme, fit-video, fullscreen toggles in the app header.

### Plugin system ([src/features/plugin](src/features/plugin/))

This is the central extension mechanism. Read [use-plugin.tsx](src/features/plugin/hooks/use-plugin.tsx) before changing anything here.

- A **plugin** is a JS module with `id`, `name`, `match: string[]` (wildcards using `*`, matched by `findWildcard` in [lib/utils.ts](src/lib/utils.ts)), `enabled`, and `components: PluginRawComponent[]`. See [types/index.ts](src/features/plugin/types/index.ts).
- Each component has a `type` from `PLUGIN_TYPE_OPTIONS` ([constants/plugin-type.options.ts](src/features/plugin/constants/plugin-type.options.ts)): `player`, `source_handler`, `header_left`, `header_right`, `controls_left`, `controls_right`, `menu_item`. The type controls **where** the component mounts ([PluginMount](src/features/plugin/components/PluginMount.tsx) for URL-bound positions, [PluginMountGlobal](src/features/plugin/components/PluginMountGlobal.tsx) for app-wide positions like header/menu). Both wrap renders in [PluginMountBoundary](src/features/plugin/components/PluginMountBoundary.tsx) (a `react-error-boundary`), so a throwing plugin TSX won't crash the app — but errors will be silently swallowed and only `console.error`-ed.
- Component `code` is a **TSX string**. At load time, [parse-plugin-component.ts](src/features/plugin/lib/parse-plugin-component.ts) runs it through Babel standalone via [TsxParser](src/lib/tsx-parser.ts) with a fixed dependency injection list: `React`, `ReactPlayer`, `require` (dynamic external import), `Player`, `Twitch` (from `window.Twitch`, loaded by `<script src="https://player.twitch.tv/js/embed/v1.js">` in [index.html](index.html)), `cn`, `Lucide`, `PlayerHudAction`, `HeaderButton`, `ui`. To expose a new dependency to plugin authors, add it to that list — plugin code cannot `import` anything else.
- **Storage**: built-in plugins live in [src/assets/builtin-plugins/](src/assets/builtin-plugins/) (loaded via `import.meta.glob`). User plugins live in `localStorage["plugins"]` as an array of URL-encoded `export default {...}` strings, dynamically `import()`ed via `data:text/javascript` URIs. On load, custom plugins are listed before built-ins and de-duplicated by `id` — so a custom plugin with the same id wins over its built-in counterpart.

### TmuxGrid + Stream + Plugin interaction

[GridView](src/pages/GridView.tsx) is the integration point: `TmuxGrid.renderItem` returns a `<DropArea>` that calls `actions.add/move/swap/set` on the grid tree, with a `<Stream url={content}>` inside. `Stream` then asks `usePlugin().findComponentByUrl(url, "player")` and mounts the first match (or falls back to `<Player>` for raw `<video>`-like sources). When you change grid behaviour, the renderItem closure is the right surface; when you change how URLs are resolved, the right surface is `findComponentByUrl` / `findPluginByUrl` in [use-plugin.tsx](src/features/plugin/hooks/use-plugin.tsx).

## Conventions

- **Path alias**: `@/*` → `src/*` ([tsconfig.json](tsconfig.json), [vite.config.ts](vite.config.ts)). Always use `@/...` imports, never relative paths that climb out of a feature.
- **shadcn/ui** style: `new-york`, base color `gray`, components live in [src/components/ui/](src/components/ui/) ([components.json](components.json)). Re-export from [components/ui/index.ts](src/components/ui/index.ts).
- **TypeScript** is `strict` with `noUnusedLocals`/`noUnusedParameters`. ESLint allows `_`-prefixed unused vars.
- **State libraries**: TanStack Query for async/server state (and as the cache for source-handler resolution), Immer/`use-immer` for tree mutations, `react-hook-form` + `zod` for forms.
- **Styling**: Tailwind v3 with CSS variables for theme tokens; merge with `cn()` from [lib/utils.ts](src/lib/utils.ts). Theme is applied pre-React in `<head>` via [lib/theme.ts](src/lib/theme.ts) to avoid FOUC.

## Gotchas

- `index.html` is processed by `vite-plugin-ejs` — it is **not** plain HTML. EJS variables come from [vite.config.ts](vite.config.ts) (`year`, `version`, `title`, etc.).
- A `Buffer` polyfill is injected globally via `@rollup/plugin-inject` and `<script src="…/buffer">` in `index.html` — some plugin code paths assume it exists.
- `vite.config.js` (the older JS variant) is **gitignored**; the live config is [vite.config.ts](vite.config.ts).
- `**/external-source-handlers/*.js` is gitignored — those are user data, never commit them.
- The `tsconfig.json` `include` array references `src/components/domains/source-handlersndlers` (a typoed leftover path that doesn't exist). Don't "fix" it without checking; it's harmless and the rest of `src` is included anyway.
