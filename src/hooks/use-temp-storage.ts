import { useContext } from "react";
import { TempStorageContext } from "../providers/temp-storage-provider";

export function useTempStorage(){
  const context = useContext(TempStorageContext);
  if (context === undefined)
    throw new Error('useTempStorage must be used within a TempStorageProvider');
  return context;
}
