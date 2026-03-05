import { usePlugin } from "@/features/plugin";

export interface StreamProps {
  url: string;
}

export function Stream({ url }: StreamProps) {
  const { findPluginByUrl, findPlayerByUrl } = usePlugin();

  const Player = findPlayerByUrl(url);
  const plugin = findPluginByUrl(url);

  if (!Player) return "Player not found";

  return <Player />;
}
