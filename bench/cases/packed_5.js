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

  const queryA = world.createQuery([TestComponentA]);
  const queryB = world.createQuery([TestComponentB]);
  const queryC = world.createQuery([TestComponentC]);
  const queryD = world.createQuery([TestComponentD]);
  const queryE = world.createQuery([TestComponentE]);

  for (let i = 0; i < count; i++) {
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponentA());
    world.addComponent(entity, new TestComponentB());
    world.addComponent(entity, new TestComponentC());
    world.addComponent(entity, new TestComponentD());
    world.addComponent(entity, new TestComponentE());
  }

  return () => {
    for (const entity of queryA.entities) {
      const component = world.getComponent(entity, TestComponentA);
      component.value *= 2;
    }
    for (const entity of queryB.entities) {
      const component = world.getComponent(entity, TestComponentB);
      component.value *= 2;
    }
    for (const entity of queryC.entities) {
      const component = world.getComponent(entity, TestComponentC);
      component.value *= 2;
    }
    for (const entity of queryD.entities) {
      const component = world.getComponent(entity, TestComponentD);
      component.value *= 2;
    }
    for (const entity of queryE.entities) {
      const component = world.getComponent(entity, TestComponentE);
      component.value *= 2;
    }
  };
};
