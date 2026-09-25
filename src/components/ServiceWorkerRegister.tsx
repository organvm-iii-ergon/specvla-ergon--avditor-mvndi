"use client";

import { useEffect } from "react";
import { cacheShaderSource } from "@/lib/shaders";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Prime shader source cache in CacheStorage / localStorage
    cacheShaderSource().catch((err) => {
      console.warn("Failed to prime shader cache:", err);
    });

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost")
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registered successfully:", registration.scope);
          })
          .catch((error) => {
            console.warn("ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
