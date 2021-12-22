declare global {
  interface Object {
    cachedComponentId: string;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T> = new (...args: any[]) => T;

export type Component = Constructor<unknown> | string;

export type NotComponent = { component: Component };

export const NOT = (component: Component): NotComponent => ({ component });

export type Components = ReadonlyArray<Component | NotComponent>;
