import FastBitSet from 'fastbitset';

import { ComponentConstructor } from './types';

/**
 * Get entity components mask
 *
 * @param entityId - entity id
 * @returns FastBitSet instance {@link FastBitSet}
 * @throws
 */
export const getEntityMask = (entityId: number, masks: Array<FastBitSet>): FastBitSet => {
  const mask = masks[entityId];
  if (!mask) {
    throw new Error(`Entity ${entityId} mask not found`);
  }
  return mask;
};

export const isValidComponent = <T>(component: unknown): component is ComponentConstructor<T> => {
  return !!component && typeof component === 'function' && 'componentId' in component;
};
