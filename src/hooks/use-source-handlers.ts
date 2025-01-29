import { useContext } from "react";
import { SourceHandlerProviderContext } from "@/providers/source-handler-provider";

export const useSourceHandlers = () => {
  const context = useContext(SourceHandlerProviderContext);

  if (context === undefined)
    throw new Error(
      "useSourceHandlers must be used within a SourceHandlerProvider"
    );

  return context;
};
