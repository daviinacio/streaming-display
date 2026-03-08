import { ReactNode, useContext } from "react";
import { usePlugin } from "..";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";
import { StreamContext, useStream } from "@/features/stream/hooks/use-stream";

export interface PluginMountProps {
  position: PLUGIN_TYPE_OPTIONS;
  fallback?: ReactNode;
  renderComponent?: (component: ReactNode) => ReactNode;
}

export function PluginMount({
  position,
  fallback,
  renderComponent,
  ...props
}: PluginMountProps) {
  const context = useStream();

  const { findComponentByUrl } = usePlugin();
  const components = findComponentByUrl(context.src, position);

  if (components.length === 0 && fallback) return fallback;

  return components.map((Component, i) => {
    const component = <Component key={i} {...context} {...props} />;
    return (renderComponent && renderComponent(component)) || component;
  });
}
