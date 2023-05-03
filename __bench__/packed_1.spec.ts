import { bench, describe } from 'vitest';

import {
  TestComponentA,
  TestComponentB,
  TestComponentC,
  TestComponentD,
  TestComponentE,
} from './components';
import { AMOUNT, init } from './helpers';

const world = init();

const queryA = world.createQuery([TestComponentA]);

for (let i = 0; i < AMOUNT; i += 1) {
  const entity = world.createEntity();
  world.addComponent(entity, new TestComponentA());
  world.addComponent(entity, new TestComponentB());
  world.addComponent(entity, new TestComponentC());
  world.addComponent(entity, new TestComponentD());
  world.addComponent(entity, new TestComponentE());
}

describe('Packed 1', () => {
  bench('reference', () => {
    queryA.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentA);
      component.value *= 2;
    });
  });
});
