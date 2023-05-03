import { bench, describe } from 'vitest';

import { TestComponentA, TestComponentB } from './components';
import { AMOUNT, init } from './helpers';

const world = init();

const queryA = world.createQuery([TestComponentA]);
const queryB = world.createQuery([TestComponentB]);

for (let i = 0; i < AMOUNT; i += 1) {
  const entity = world.createEntity();
  world.addComponent(entity, new TestComponentA());
}

describe('Entity cycle', () => {
  bench('reference', () => {
    queryA.entities.forEach(() => {
      const entity0 = world.createEntity();
      world.addComponent(entity0, new TestComponentB());
      const entity1 = world.createEntity();
      world.addComponent(entity1, new TestComponentB());
    });

    queryB.entities.forEach((entity) => {
      world.removeEntity(entity);
    });
  });
});
