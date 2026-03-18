"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../stores/auth-store";

export function AuthHydrator() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return null;
}