import { Player, PlayerHudAction } from "@/features/stream";
import { TsxParser } from "@/lib/tsx-parser";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";

import ReactPlayer from "react-player";

export async function parsePluginComponent(code: string) {
  const { parse } = TsxParser({
    dependencies: [
      { name: "ReactPlayer", content: ReactPlayer },
      { name: "require", content: loadExternalLib },
      { name: "Player", content: Player },
      // @ts-ignore
      { name: "Twitch", content: window.Twitch },
      { name: "cn", content: cn },
      { name: "Lucide", content: Lucide },
      { name: "PlayerHudAction", content: PlayerHudAction },
    ],
  });
  return await parse(code);
}

async function loadExternalLib(url: string) {
  console.log("loadExternalLib", url);
  try {
    // O Babel vai manter este import() como nativo se 'modules: false' estiver ativo
    const module = await import(
      /* @vite-ignore */ /* webpackIgnore: true */ url
    );

    console.log("Lib carregada com sucesso:", module);
    return module;
  } catch (error) {
    console.error("Erro ao baixar a lib da URL:", url, error);
    return null;
  }
}
