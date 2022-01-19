import FastBitSet from 'fastbitset';

import { getEntityMask } from '../src/Helpers';

describe('Helpers tests', () => {
  describe('GetEntityMask', () => {
    const arr = [0, 1, 2];
    const entityId = 0;
    const masks = [new FastBitSet(arr)];

    it('Should return mask', () => {
      const mask = getEntityMask(entityId, masks);
      expect(mask).toBeDefined();
      expect(mask.array()).toEqual(arr);
    });

    it('Should throw error if mask not exist', () => {
      expect(() => getEntityMask(entityId + 1, masks)).toThrow();
    });
  });
});
