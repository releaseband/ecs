declare global {
  interface Object {
    cachedComponentId: string;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T> = new (...args: any[]) => T;
