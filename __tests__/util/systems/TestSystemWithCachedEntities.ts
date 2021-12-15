import { System } from '../../../src/System';
import { World } from '../../../src/World';

export default class TestSystemWithCachedEntities implements System {
  public entity;

  constructor(public world: World) {
    this.entity = world.createEntity();
  }

  exit(): void {
    this.world.removeEntity(this.entity);
  }
}
