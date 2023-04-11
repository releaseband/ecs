import { System, World } from '../../../src';

export default class TestSystemWithCachedEntities implements System {
  public entity;

  constructor(public world: World) {
    this.entity = world.createEntity();
  }

  exit(): void {
    this.world.removeEntity(this.entity);
  }
}
