import { type ClassValue, clsx } from "clsx";
import React, { ReactElement, ReactNode } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debug utilities
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// JSX utilities
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

// Array utilities
export const distinct =
  <A extends Array<O>, O>(...keys: Array<keyof O>) =>
  (it: O, i: keyof A, a: A) =>
    a.findIndex((ait) =>
      typeof it === "object" && typeof it === "object" && it && keys.length > 0
        ? keys.every((key) => ait[key] === it[key])
        : ait === it
    ) === i;

export function exclude<O extends object, KA extends Array<keyof O>>(
  obJ?: O,
  ...attributes: KA
) {
  if (!obJ) return undefined as unknown as O;
  const newObj = { ...obJ };
  attributes.forEach((attr) => {
    delete newObj[attr];
  });
  return newObj as Omit<O, KA[number]>;
}

export function findWildcard(list: string[] | undefined, search: string) {
  return (list || []).find((it) =>
    it.split("*").every((its) => search.indexOf(its) >= 0)
  );
}

// String utilities
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
      // Replace space to '_'
      .replace(/[ ]/g, "-")
      // Remove all not allowed characters
      .replace(/[^-0-9_a-zA-Z]/g, "")
      // Remove all not alphanumeric characters on start
      .replace(/^[^0-9a-zA-Z]/g, "")
  );
}

export function bytesToString(bytes: number) {
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes <= 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function millisecondsToString(milliseconds: number) {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  const seconds = milliseconds / 1000;
  if (seconds < 60) return `${Math.trunc(seconds)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.trunc(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.trunc(hours)}h`;
  const days = hours / 24;
  return `${Math.trunc(days)}d`;
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function hslToRgb(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16);
  };
  return [f(0), f(8), f(4)];
}

export function hslToHex(hsl: string) {
  const [h, s, l] = hsl.split(" ");
  return `#${hslToRgb(parseInt(h), parseInt(s), parseInt(l)).join("")}`;
}

// Browser utilities
export function copyToClipboard(text: string, context?: string) {
  navigator.clipboard.writeText(text);
  toast.info(((context || "") + " copied to clipboard").trim(), {
    duration: 1000,
  });
}

export function downloadUrl(url: string, filename: string) {
  var element = document.createElement("a");
  element.setAttribute("href", url);
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
