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

world.registerComponents([
  TestComponentA,
  TestComponentB,
  TestComponentC,
  TestComponentD,
  TestComponentE,
]);

const queryA = world.createQuery([TestComponentA]);
const queryB = world.createQuery([TestComponentB]);
const queryC = world.createQuery([TestComponentC]);
const queryD = world.createQuery([TestComponentD]);
const queryE = world.createQuery([TestComponentE]);

for (let i = 0; i < AMOUNT; i += 1) {
  const entity = world.createEntity();
  world.addComponent(entity, new TestComponentA());
  world.addComponent(entity, new TestComponentB());
  world.addComponent(entity, new TestComponentC());
  world.addComponent(entity, new TestComponentD());
  world.addComponent(entity, new TestComponentE());
}

describe('Packed 5', () => {
  bench('reference', () => {
    queryA.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentA);
      component.value *= 2;
    });
    queryB.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentB);
      component.value *= 2;
    });
    queryC.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentC);
      component.value *= 2;
    });
    queryD.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentD);
      component.value *= 2;
    });
    queryE.entities.forEach((entity) => {
      const component = world.getComponent(entity, TestComponentE);
      component.value *= 2;
    });
  });
});
