export const DEFAULT_GROUP_NAME = 'default';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T> = new (...args: any[]) => T;

export type ComponentInstance<T> = T extends object & { call?: never } ? T : never;

export type Component = Constructor<unknown> | string;

export type NotComponent = { component: Component };

export const NOT = (component: Component): NotComponent => ({ component });

export type Components = ReadonlyArray<Component | NotComponent>;

export type DebugData = {
  updateTime: number;
  updateTimeDetailed: Map<string, number>;
};

export interface System {
  /**
   * Method will be executed on every world update
   *
   * @param dt - time between frames
   */
  update?(dt: number): void;

  /**
   * will be executed on system enable
   */
  enable?(): void;

  /**
   * will be executed on system disable
   */
  disable?(): void;

  /**
   * Method will be executed on system exit from the world
   */
  exit?(): void;
}

export interface Group {
  /**
   * is group disabled
   */
  disabled: boolean;
  /**
   * systems container
   */
  systems: Array<System>;
}
