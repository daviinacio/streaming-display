import { useErrorBoundary } from "react-error-boundary";

export function PluginMountBoundary() {
  const { error } = useErrorBoundary();

  console.error("PluginMountBoundary", error);

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="font-bold text-destructive">
        Failed to load component
      </span>
      <span className="text-foreground">
        {error instanceof Error ? error.message : String(error)}
      </span>
    </div>
  );
}
