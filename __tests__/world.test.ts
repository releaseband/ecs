import { World, RESERVED_MASK_INDICES } from '../src/World';

const ENTITIES_COUNT = 1_000_000;
const TEST_ENTITIES_AMOUNT = 500;

class TestComponent0 {}
class TestComponent1 {}

describe('World tests', () => {
  it('World init', () => {
    const world = new World(ENTITIES_COUNT);
    expect(world.entitiesMax).toEqual(ENTITIES_COUNT);
    expect(world.lookupTable.length).toEqual(ENTITIES_COUNT);
    expect(world.components).toBeDefined();
    expect(world.masks).toBeDefined();
    expect(world.registeredComponents).toBeDefined();
    expect(Object.keys(world.registeredComponents).length).toEqual(
      RESERVED_MASK_INDICES.length
    );
  });
  it('Register components', () => {
    const world = new World(ENTITIES_COUNT);
    const RESERVED_INDICES = RESERVED_MASK_INDICES.length;
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    expect(Object.keys(world.registeredComponents).length).toEqual(
      RESERVED_INDICES + 2
    );
    expect(world.getComponentIndex(TestComponent0)).toEqual(
      RESERVED_INDICES + 0
    );
    expect(world.getComponentIndex(TestComponent1)).toEqual(
      RESERVED_INDICES + 1
    );
  });
  it('Must throw error for non-registered component', () => {
    const world = new World(ENTITIES_COUNT);

    expect(() => world.getComponentIndex(TestComponent0)).toThrow(
      `Component ${TestComponent0.name} is not registered`
    );
  });
  it('removeEntities should remove array of entities', () => {
    const world = new World(ENTITIES_COUNT);
    const entities = Array<number>();
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);

    for (let i = 0; i < TEST_ENTITIES_AMOUNT; i += 1) {
      const entity = world.createEntity();
      world.addComponent(entity, new TestComponent0());
      world.addComponent(entity, new TestComponent1());
      entities.push(entity);
    }

    expect(world.entities).toHaveLength(TEST_ENTITIES_AMOUNT);
    expect(entities).toHaveLength(TEST_ENTITIES_AMOUNT);
    world.removeEntities(entities);
    expect(world.entities).toHaveLength(0);
    expect(world.pool).toHaveLength(TEST_ENTITIES_AMOUNT);
  });
  it('Should remove all entities from world if clear called', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);

    for (let i = 0; i < TEST_ENTITIES_AMOUNT; i += 1) {
      const entity = world.createEntity();
      world.addComponent(entity, new TestComponent0());
      world.addComponent(entity, new TestComponent1());
    }

    expect(world.entities).toHaveLength(TEST_ENTITIES_AMOUNT);
    world.clear();
    expect(world.entities).toHaveLength(0);
    expect(world.pool).toHaveLength(TEST_ENTITIES_AMOUNT);
  });
});
