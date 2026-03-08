import { ReactNode } from "react";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";

export interface PluginCommon {
  isBuiltin?: boolean;
  id: string;
  enabled: boolean;
  name: string;
  match: Array<string>;
}

export interface PluginRaw extends PluginCommon {
  components: Array<PluginRawComponent>;
}

export type PluginRawComponent = {
  enabled: boolean;
  name: string;
  type: PLUGIN_TYPE_OPTIONS;
  code: string;
};

export interface Plugin extends PluginCommon {
  readonly: boolean;
  components: Array<PluginComponent>;
}

export type PluginComponent = {
  enabled: boolean;
  type: PLUGIN_TYPE_OPTIONS;
  name: string;
  component: (props: any) => Promise<any> | any;
};
