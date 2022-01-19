import FastBitSet from 'fastbitset';

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

/**
 * Get entity components mask
 *
 * @param entityId - entity id
 * @returns FastBitSet instance {@link FastBitSet}
 * @throws
 */
export const getEntityMask = (
  entityId: number,
  masks: Array<FastBitSet>
): FastBitSet => {
  const mask = masks[entityId];
  if (!mask) {
    throw new Error(`Entity ${entityId} mask not found`);
  }
  return mask;
};
