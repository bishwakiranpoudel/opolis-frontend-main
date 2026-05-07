"use client";

import { useEffect } from "react";
import { getFirebaseClientApp } from "@/lib/firebase/client";
import { getFirebaseWebConfig } from "@/lib/firebase/web-config";

/**
 * Initializes Firebase Analytics in the browser (dynamic import avoids SSR issues).
 */
export function FirebaseAnalyticsInit() {
  useEffect(() => {
    const cfg = getFirebaseWebConfig();
    if (!cfg.measurementId) return;

    void import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
      void isSupported().then((ok) => {
        if (!ok) return;
        const app = getFirebaseClientApp();
        if (app) getAnalytics(app);
      });
    });
  }, []);

  return null;
}
