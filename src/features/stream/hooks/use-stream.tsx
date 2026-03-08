import { createContext, PropsWithChildren, useContext } from "react";

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) throw new Error("Stream is required");
  return context;
}

export interface StreamContextState {
  src: string;
  handler?: any;
}

export const StreamContext = createContext<StreamContextState | null>(null);

export interface StreamProviderProps extends PropsWithChildren {
  src: string;
  handler?: any;
}

export function StreamProvider({ children, ...props }: StreamProviderProps) {
  return (
    <StreamContext.Provider
      value={{
        ...props,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}
