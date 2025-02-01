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
  fullscreen?: boolean;
  pip?: boolean;
  refresh?: boolean;
  volume?: boolean;
};

export type StreamingStatus = "success" | "error" | "unavailable";

export type SourceHandler = {
  id: string;
  version: string;
  label: string;
  icon?: string;
  logo?: {
    url: string;
    height?: string;
  };
  urlMatch: string[];
  resolver: (props: { url: string }) => Promise<{
    title: string;
    status: StreamingStatus;
    sourceUrl: string;
  }>;
  allow?: PlayerAllow;
  hidden?: boolean;
};

declare module "react-hook-form" {
  // @ts-ignore
  export type UseFormReturn<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues extends FieldValues | undefined = undefined
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

export type Guideline = {
  // id: string;
  orientation: "vertical" | "horizontal";
  left: string;
  right: string;
  top: string;
  bottom: string;
  offset: number;
};

export type GridItem = {
  url: string;
  column: number;
  row: number;
};

export type GridItemPosition = GridItem & {
  x: number;
  y: number;
  width: number;
  height: number;
};
