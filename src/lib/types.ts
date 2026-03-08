import type {
  Control,
  FieldValues,
  FormState,
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormTrigger,
  UseFormUnregister,
  UseFormWatch,
} from "react-hook-form";

export type PlayerAllow = {
  maximize?: boolean;
  pip?: boolean;
  refresh?: boolean;
  volume?: boolean;
  copySourceUrl?: boolean;
};

export const StreamingStatus = ["online", "offline", "away"] as const;
export type StreamingStatus = (typeof StreamingStatus)[number];

export const SourceHandlerParams = `{
  url: string;
  minimize: () => void;
  setRefetchInterval: (value: number | false) => void;
};` as const;

export type SourceHandlerParams = {
  url: string;
  minimize: () => void;
  setRefetchInterval: (value: number | false) => void;
};

export const SourceHandlerResult = `{
  title: string;
  sourceUrl: string;
};` as const;

export type SourceHandlerResult = {
  title: string;
  sourceUrl: string;
};

export const SourceHandlerResultRequired = ["title", "sourceUrl"];

export type SourceHandler = {
  id: string;
  version: string;
  label: string;
  icon?: string;
  logo?: string;
  urlMatch: string[];
  resolver: ($params: SourceHandlerParams) => Promise<SourceHandlerResult>;
  allow?: PlayerAllow;
  hidden?: boolean;
};

declare module "react-hook-form" {
  // @ts-ignore
  export type UseFormReturn<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues extends FieldValues | undefined = undefined,
  > = {
    watch: UseFormWatch<TFieldValues>;
    getValues: UseFormGetValues<TFieldValues>;
    getFieldState: UseFormGetFieldState<TFieldValues>;
    setError: UseFormSetError<TFieldValues>;
    clearErrors: UseFormClearErrors<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    trigger: UseFormTrigger<TFieldValues>;
    formState: FormState<TFieldValues>;
    resetField: UseFormResetField<TFieldValues>;
    reset: UseFormReset<TFieldValues>;
    handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues>;
    unregister: UseFormUnregister<TFieldValues>;
    control: Control<TFieldValues, TContext>;
    register: UseFormRegister<TFieldValues>;
    setFocus: UseFormSetFocus<TFieldValues>;
    isFetching?: boolean;
    disabled?: boolean;
  };
}

export type GridItem = {
  id: string;
  column: number;
  row: number;
};

export type GridItemPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};
