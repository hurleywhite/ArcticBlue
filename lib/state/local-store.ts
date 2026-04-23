"use client";

import { useCallback, useEffect, useState } from "react";

/*
  Thin wrapper around localStorage that survives SSR and gives a reactive
  hook interface. Everything here is a temporary stand-in for Supabase
  persistence — when real DB wiring lands, swap these hooks for Supabase
  server actions. The shape of what's stored matches the schema, so the
  migration should be trivial.
*/

const SAFE_STORAGE: Storage | null =
  typeof window !== "undefined" ? window.localStorage : null;

function read<T>(key: string, fallback: T): T {
  if (!SAFE_STORAGE) return fallback;
  try {
    const raw = SAFE_STORAGE.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!SAFE_STORAGE) return;
  try {
    SAFE_STORAGE.setItem(key, JSON.stringify(value));
    // dispatch a same-tab event so other hooks re-read
    window.dispatchEvent(new CustomEvent(`localstore:${key}`));
  } catch {
    // quota or privacy mode — swallow
  }
}

export function useLocalStore<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);

  // Hydrate from localStorage after mount — avoids SSR mismatch
  useEffect(() => {
    setValue(read<T>(key, initial));
    const onChange = () => setValue(read<T>(key, initial));
    window.addEventListener(`localstore:${key}`, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(`localstore:${key}`, onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setter = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        write(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, setter];
}
