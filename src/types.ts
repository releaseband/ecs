/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T> = new (...args: any[]) => T;

export type ComponentInstance<T> = T extends object & NonNullable<T> ? T : never;

export type Component = Constructor<unknown> | string;

export type NotComponent = { component: Component };

export const NOT = (component: Component): NotComponent => ({ component });

export type Components = ReadonlyArray<Component | NotComponent>;

export type DebugData = {
  updateTime: number;
  updateTimeDetailed: Map<string, number>;
};
