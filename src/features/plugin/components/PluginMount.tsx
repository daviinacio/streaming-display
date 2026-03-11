import { ErrorBoundary } from "react-error-boundary";

import { useStream } from "@/features/stream/hooks/use-stream";
import { ReactNode } from "react";
import { usePlugin } from "..";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";
import { PluginMountBoundary } from "./PluginMountBoundary";
import { Slot } from "@radix-ui/react-slot";

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

  if (components.length === 0 && fallback)
    return <Slot {...props}>{fallback}</Slot>;

  return (
    <ErrorBoundary fallback={<PluginMountBoundary />}>
      {components.map((Component, i) => {
        const component = <Component key={i} {...context} {...props} />;
        return (renderComponent && renderComponent(component)) || component;
      })}
    </ErrorBoundary>
  );
}
