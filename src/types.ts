export const DEFAULT_GROUP_NAME = 'default';

export type ClassInstance<T> = T extends object & { call?: never } & {
  constructor: { componentId?: string };
}
  ? T
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export interface ComponentConstructor<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  readonly componentId: string;
}

export type Tag = string;

export type Not<T> = { component: ComponentConstructor<T> | Tag };

export const NOT = <T>(component: ComponentConstructor<T> | Tag): Not<T> => ({ component });

export type Components = ReadonlyArray<ComponentConstructor<unknown> | Not<unknown> | Tag>;

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
