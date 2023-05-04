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

const queryAB = world.createQuery([TestComponentA, TestComponentB]);
const queryCD = world.createQuery([TestComponentC, TestComponentD]);
const queryCE = world.createQuery([TestComponentC, TestComponentE]);

for (let i = 0; i < AMOUNT; i += 1) {
  const entityAB = world.createEntity();
  world.addComponent(entityAB, new TestComponentA());
  world.addComponent(entityAB, new TestComponentB());
  const entityABC = world.createEntity();
  world.addComponent(entityABC, new TestComponentA());
  world.addComponent(entityABC, new TestComponentB());
  world.addComponent(entityABC, new TestComponentC());
  const entityABCD = world.createEntity();
  world.addComponent(entityABCD, new TestComponentA());
  world.addComponent(entityABCD, new TestComponentB());
  world.addComponent(entityABCD, new TestComponentC());
  world.addComponent(entityABCD, new TestComponentD());
  const entityABCE = world.createEntity();
  world.addComponent(entityABCE, new TestComponentA());
  world.addComponent(entityABCE, new TestComponentB());
  world.addComponent(entityABCE, new TestComponentC());
  world.addComponent(entityABCE, new TestComponentE());
}

describe('Simple iter', () => {
  bench('reference', () => {
    queryAB.entities.forEach((entity) => {
      const componentA = world.getComponent(entity, TestComponentA);
      const componentB = world.getComponent(entity, TestComponentB);
      const t = componentA.value;
      componentA.value = componentB.value;
      componentB.value = t;
    });
    queryCD.entities.forEach((entity) => {
      const componentC = world.getComponent(entity, TestComponentC);
      const componentD = world.getComponent(entity, TestComponentD);
      const t = componentC.value;
      componentC.value = componentD.value;
      componentD.value = t;
    });
    queryCE.entities.forEach((entity) => {
      const componentC = world.getComponent(entity, TestComponentC);
      const componentE = world.getComponent(entity, TestComponentE);
      const t = componentC.value;
      componentC.value = componentE.value;
      componentE.value = t;
    });
  });
});
