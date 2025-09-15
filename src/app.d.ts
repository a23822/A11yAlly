// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace App {
    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface Locals {
      user: DecodedIdToken | null;
    }
  }

  interface Window {
    RevenueCat?: any;
  }
}

export {};
