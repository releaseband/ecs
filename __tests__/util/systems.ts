import { System } from '../../src/System';
import { World } from '../../src/World';

export class TestSystem0 implements System {
  testValue: number | null = null;
  update(dt: number): void {
    this.testValue = dt;
  }
}

export class TestSystem1 implements System {
  public testValue: number | null = null;
  update(dt: number): void {
    this.testValue = dt;
  }
}

export class TestSystem2 implements System {
  public testValue: number | null = null;
  exit(): void {
    this.testValue = 12345;
  }
}

export class TestSystemWithCachedEntities implements System {
  public entity;
  constructor(public world: World) {
    this.entity = world.createEntity();
  }
  exit(): void {
    this.world.removeEntity(this.entity);
  }
}
