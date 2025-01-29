import { useContext } from "react";
import { AlertDialogContext } from "@/providers/alert-dialog-provider";

export default function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (context === undefined)
    throw new Error("useAlertDialog must be used within a AlertDialogProvider");
  return context;
}
