import {
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  DatabaseZapIcon,
  MonitorPlayIcon,
} from "lucide-react";

export const PLUGIN_TYPE_OPTIONS = {
  player: { label: "Player", icon: MonitorPlayIcon },
  source_handler: { label: "Source Handler", icon: DatabaseZapIcon },
  header_left: { label: "Header Left", icon: ArrowUpLeftIcon },
  header_right: { label: "Header Right", icon: ArrowUpRightIcon },
  controls_left: { label: "Controls Left", icon: ArrowDownLeftIcon },
  controls_right: {
    label: "Controls Right",
    icon: ArrowDownRightIcon,
  },
} as const;

export type PLUGIN_TYPE_OPTIONS = keyof typeof PLUGIN_TYPE_OPTIONS;
