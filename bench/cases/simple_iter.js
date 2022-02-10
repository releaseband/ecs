import { World } from '../../dist/World.js';

export default (count) => {
  const world = new World(1_000_000);

  class TestComponentA {
    constructor() {
      this.value = 0;
    }
  }
  class TestComponentB {
    constructor() {
      this.value = 1;
    }
  }
  class TestComponentC {
    constructor() {
      this.value = 1;
    }
  }
  class TestComponentD {
    constructor() {
      this.value = 1;
    }
  }
  class TestComponentE {
    constructor() {
      this.value = 1;
    }
  }

  world.registerComponent(TestComponentA);
  world.registerComponent(TestComponentB);
  world.registerComponent(TestComponentC);
  world.registerComponent(TestComponentD);
  world.registerComponent(TestComponentE);

  const queryAB = world.createQuery([TestComponentA, TestComponentB]);
  const queryCD = world.createQuery([TestComponentC, TestComponentD]);
  const queryCE = world.createQuery([TestComponentC, TestComponentE]);

  for (let i = 0; i < count; i++) {
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

  return () => {
    for (const entity of queryAB.entities) {
      const componentA = world.getComponent(entity, TestComponentA);
      const componentB = world.getComponent(entity, TestComponentB);
      const t = componentA.value;
      componentA.value = componentB.value;
      componentB.value = t;
    }
    for (const entity of queryCD.entities) {
      const componentC = world.getComponent(entity, TestComponentC);
      const componentD = world.getComponent(entity, TestComponentD);
      const t = componentC.value;
      componentC.value = componentD.value;
      componentD.value = t;
    }
    for (const entity of queryCE.entities) {
      const componentC = world.getComponent(entity, TestComponentC);
      const componentE = world.getComponent(entity, TestComponentE);
      const t = componentC.value;
      componentC.value = componentE.value;
      componentE.value = t;
    }
  };
};
