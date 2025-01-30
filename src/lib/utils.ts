import { type ClassValue, clsx } from "clsx";
import React, { ReactElement, ReactNode } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Array utilities
export const distinct =
  <A extends Array<O>, O>(...keys: Array<keyof O>) =>
  (it: O, i: keyof A, a: A) =>
    a.findIndex((ait) =>
      typeof it === "object" && typeof it === "object" && it && keys.length > 0
        ? keys.every((key) => ait[key] === it[key])
        : ait === it
    ) === i;

export function joinJSX(children: ReactElement[], separator: ReactElement) {
  return children
    .map((child, i) =>
      React.cloneElement(child as React.ReactElement, {
        key: child.key || i,
        ...child.props,
      })
    )
    .reduce((acc, child, i) => {
      if (i === 0) return [child];
      //@ts-ignore
      return [
        ...acc,
        React.cloneElement(separator, { key: `separator-${i}` }),
        child,
      ];
    }, [] as ReactNode[]);
}

export function listIntoChunks(list: string[], chunkSize?: number) {
  if (!chunkSize) chunkSize = Math.ceil(Math.sqrt(list.length));

  const result = [];

  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }

  return result;
}

export type Direction =
  | "top-left-to-right"
  | "top-right-to-bottom"
  | "top-right-to-left"
  | "bottom-right-to-left"
  | "bottom-left-to-right";

export function diagonalArray(
  arr: string[],
  direction: Direction = "top-right-to-left"
) {
  const n = Math.ceil(Math.sqrt(arr.length)); // Calculate the size of the 2D array
  const result = Array.from({ length: n }, () => [] as string[]);

  let index = 0;

  if (direction === "top-left-to-right") {
    for (let diag = 0; diag < 2 * n - 1; diag++) {
      for (let i = 0; i <= diag; i++) {
        const j = diag - i;
        if (i < n && j < n && index < arr.length) {
          result[i][j] = arr[index];
          index++;
        }
      }
    }
  } else if (direction === "top-right-to-bottom") {
    for (let diag = 0; diag < 2 * n - 1; diag++) {
      for (let i = 0; i <= diag; i++) {
        const j = diag - i;
        if (i < n && j < n && index < arr.length) {
          // For top-right to bottom-left, use reversed row and column
          result[j][n - 1 - i] = arr[index];
          index++;
        }
      }
    }
  } else if (direction === "top-right-to-left") {
    for (let diag = 0; diag < 2 * n - 1; diag++) {
      for (let i = 0; i <= diag; i++) {
        const j = diag - i;
        if (j < n && i < n && index < arr.length) {
          // Place elements starting from the top-right to the left
          result[i][n - 1 - j] = arr[index];
          index++;
        }
      }
    }
  } else if (direction === "bottom-right-to-left") {
    for (let diag = 0; diag < 2 * n - 1; diag++) {
      for (let i = 0; i <= diag; i++) {
        const j = diag - i;
        if (i < n && j < n && index < arr.length) {
          // Reverse the row order for bottom-right to bottom-left
          result[n - 1 - i][n - 1 - j] = arr[index];
          index++;
        }
      }
    }
  } else if (direction === "bottom-left-to-right") {
    for (let diag = 0; diag < 2 * n - 1; diag++) {
      for (let i = 0; i <= diag; i++) {
        const j = diag - i;
        if (i < n && j < n && index < arr.length) {
          // Reverse the row but keep the columns normal for bottom-left to bottom-right
          result[n - 1 - j][i] = arr[index];
          index++;
        }
      }
    }
  }

  return result;
}

// Number utilities
export function floatLimitDecimals(
  value: number,
  decimals: number = 2
): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// String utilities
export function getUrlRouteIdentifier(url: string): string {
  let identifier = url.split("/")[3] || "";
  identifier = (identifier && identifier.split("?")[0]) || "";
  return identifier;
}

export function getUrlQueryIdentifier(url: string, param: string): string {
  const searchParam = new URLSearchParams(url.split("?")[1]);
  return searchParam.get(param) || "";
}

export function copyToClipboard(text: string, context?: string) {
  navigator.clipboard.writeText(text);
  toast.info(((context || "") + " copied to clipboard").trim());
}

export function exclude<O extends object, KA extends Array<keyof O>>(
  obJ?: O,
  ...attributes: KA
) {
  if (!obJ) return undefined as unknown as O;
  const newObj = { ...obJ };
  attributes.forEach((attr) => {
    delete newObj[attr];
  });
  // Return the new object without the excluded attributes
  return newObj as Omit<O, KA[number]>;
}

export function normalizeUsername(username: string) {
  return (
    username
      // Put all characters to lower case
      .toLowerCase()
      // Replaces all grammatical accents for non accents characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace ' ' and '-' to '_'
      .replace(/[ -]/g, "_")
      // Remove all not allowed characters
      .replace(/[^.0-9_a-zA-Z]/g, "")
      // Avoid multiple dots character
      .replace(/[.]{2,}/g, ".")
      // Remove all not alphanumeric characters on start
      .replace(/^[^0-9a-zA-Z]/g, "")
  );
}

export function normalizeIdentifier(identifier?: string) {
  if (!identifier) return;
  return (
    identifier
      // Put all characters to lower case
      .toLowerCase()
      // Replaces all grammatical accents for non accents characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace ' ' and '_' to '-'
      .replace(/[ _]/g, "-")
      // Remove all not allowed characters
      .replace(/[^.0-9_a-zA-Z]/g, "")
      // Avoid multiple dots character
      .replace(/[.]{2,}/g, ".")
      // Remove all not alphanumeric characters on start
      .replace(/^[^0-9a-zA-Z]/g, "")
  );
}

export function findWildcard(list: string[] | undefined, search: string) {
  return (list || []).find((it) =>
    it.split("*").every((its) => search.indexOf(its) >= 0)
  );
}
