import FastBitSet from 'fastbitset';

declare global {
  interface Object {
    cachedComponentId: string;
  }
}

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
