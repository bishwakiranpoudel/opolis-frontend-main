/**
 * Firebase Web SDK config (NEXT_PUBLIC_* only — safe for the browser bundle).
 * Do not put service account secrets here.
 *
 * Production defaults target project `opolis-9cd29`. Override any field via
 * NEXT_PUBLIC_FIREBASE_* for staging or alternate environments.
 */

const PRODUCTION_FIREBASE_WEB = {
  apiKey: "AIzaSyB86xrtpVyonS7LVsy-1-ycPW4wa2TZwa0",
  authDomain: "opolis-9cd29.firebaseapp.com",
  projectId: "opolis-9cd29",
  storageBucket: "opolis-9cd29.firebasestorage.app",
  messagingSenderId: "677894886560",
  appId: "1:677894886560:web:a19debc95fcbb61d8ee5c5",
  measurementId: "G-F4MC3VZGFS",
} as const;

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  /** GA4 measurement ID — optional for Auth/Firestore but required for Analytics. */
  measurementId?: string;
};

export function getFirebaseWebConfig(): FirebaseWebConfig {
  return {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
      PRODUCTION_FIREBASE_WEB.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      PRODUCTION_FIREBASE_WEB.authDomain,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      PRODUCTION_FIREBASE_WEB.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      PRODUCTION_FIREBASE_WEB.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
      PRODUCTION_FIREBASE_WEB.messagingSenderId,
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ||
      PRODUCTION_FIREBASE_WEB.appId,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() ||
      PRODUCTION_FIREBASE_WEB.measurementId,
  };
}

export function isFirebaseWebConfigComplete(): boolean {
  const c = getFirebaseWebConfig();
  return Boolean(
    c.apiKey &&
      c.authDomain &&
      c.projectId &&
      c.storageBucket &&
      c.messagingSenderId &&
      c.appId
  );
}
