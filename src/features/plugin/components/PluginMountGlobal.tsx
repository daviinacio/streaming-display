import { ErrorBoundary } from "react-error-boundary";

import { Slot } from "@radix-ui/react-slot";
import { ReactNode } from "react";
import { usePlugin } from "..";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";
import { PluginMountBoundary } from "./PluginMountBoundary";

export interface PluginMountGlobalProps {
  position: PLUGIN_TYPE_OPTIONS;
  fallback?: ReactNode;
  renderComponent?: (component: ReactNode) => ReactNode;
}

export function PluginMountGlobal({
  position,
  fallback,
  renderComponent,
  ...props
}: PluginMountGlobalProps) {
  const { findComponentByPosition } = usePlugin();
  const components = findComponentByPosition(position);

  if (components.length === 0 && fallback)
    return <Slot {...props}>{fallback}</Slot>;

  return (
    <ErrorBoundary fallback={<PluginMountBoundary />}>
      {components.map((Component, i) => {
        const component = <Component key={i} {...props} />;
        return (renderComponent && renderComponent(component)) || component;
      })}
    </ErrorBoundary>
  );
}
