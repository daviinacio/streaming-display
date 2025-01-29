import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

type AlertOptionValue = string | boolean | number;

type AlertOption = {
  label: string;
  value: AlertOptionValue;
};

type AlertState = {
  isOpen: boolean;
  title: string;
  message: string;
  resolve: (value: AlertOptionValue) => void;
  options: Array<AlertOption>;
};

export interface AlertDialogContextProps {
  confirm: (title: string, message: string) => Promise<boolean>;
}

export const AlertDialogContext = createContext<
  AlertDialogContextProps | undefined
>(undefined);

export function AlertDialogProvider({ children }: PropsWithChildren) {
  const [alertState, setAlertState] = useState<AlertState | undefined>();

  useEffect(() => {
    if (alertState?.isOpen === false) {
      setTimeout(() => setAlertState(undefined), 100);
    }
  }, [alertState]);

  const handleConfirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setAlertState({
        isOpen: true,
        title,
        message,
        resolve: (value) => resolve(Boolean(value)),
        options: [{ label: "Continue", value: true }],
      });
    });
  };

  const handleResolve = useCallback(
    (value: AlertOptionValue) => {
      if (alertState) {
        alertState.resolve(value);
        setAlertState((state) => (state ? { ...state, isOpen: false } : state));
      }
    },
    [alertState]
  );

  return (
    <AlertDialogContext.Provider
      value={{
        confirm: handleConfirm,
      }}
    >
      {children}
      <AlertDialog open={alertState?.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState?.title}</AlertDialogTitle>
            <AlertDialogDescription className="select-text">
              {alertState?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleResolve(false)}>
              Cancel
            </AlertDialogCancel>
            {alertState?.options.map((option) => (
              <AlertDialogAction
                key={option.label}
                onClick={() => handleResolve(option.value)}
              >
                {option.label}
              </AlertDialogAction>
            ))}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}
