import { bench, describe } from 'vitest';

import { TestComponentA, TestComponentB } from './components';
import { AMOUNT, init } from './helpers';

const world = init();

const queryA = world.createQuery([TestComponentA]);
const queryB = world.createQuery([TestComponentA, TestComponentB]);

for (let i = 0; i < AMOUNT; i += 1) {
  const entity = world.createEntity();
  world.addComponent(entity, new TestComponentA());
}

describe('Add and remove component', () => {
  bench('reference', () => {
    queryA.entities.forEach((entity) => {
      world.addComponent(entity, new TestComponentB());
    });

    queryB.entities.forEach((entity) => {
      world.removeComponent(entity, TestComponentB);
    });
  });
});
