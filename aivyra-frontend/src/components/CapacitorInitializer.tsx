"use client";

import { useEffect } from "react";

export default function CapacitorInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Capacitor) {
      // Dynamically import @capacitor/app only inside a Capacitor webview
      import("@capacitor/app").then(({ App }) => {
        App.addListener("backButton", (data) => {
          if (data.canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      }).catch(err => {
        console.error("Failed to load Capacitor App plugin:", err);
      });
    }
  }, []);

  return null;
}
