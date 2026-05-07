/**
 * Firebase client (browser) — Firestore / Storage for interactive or future client reads.
 * Server-rendered pages use Firebase Admin via `@/lib/firestore-content` instead.
 */

import {
  type FirebaseApp,
  type FirebaseOptions,
  getApps,
  initializeApp,
} from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { getFirebaseWebConfig, isFirebaseWebConfigComplete } from "@/lib/firebase/web-config";

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;

function toFirebaseOptions(c: ReturnType<typeof getFirebaseWebConfig>): FirebaseOptions {
  const base: FirebaseOptions = {
    apiKey: c.apiKey,
    authDomain: c.authDomain,
    projectId: c.projectId,
    storageBucket: c.storageBucket,
    messagingSenderId: c.messagingSenderId,
    appId: c.appId,
  };
  if (c.measurementId) base.measurementId = c.measurementId;
  return base;
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!isFirebaseWebConfigComplete()) return null;
  const options = toFirebaseOptions(getFirebaseWebConfig());
  if (!getApps().length) {
    app = initializeApp(options);
  } else {
    app = getApps()[0]!;
  }
  return app ?? null;
}

/** Client Firestore (requires rules allowing read for the data you query). */
export function getClientFirestore(): Firestore | null {
  const a = getFirebaseClientApp();
  if (!a) return null;
  if (!firestore) firestore = getFirestore(a);
  return firestore;
}

/** Firebase Auth (browser). Requires complete web config. */
export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseClientApp();
  if (!a) return null;
  if (!auth) auth = getAuth(a);
  return auth;
}
