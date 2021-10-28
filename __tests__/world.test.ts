import { World, RESERVED_MASK_INDICES } from '../src/World';
import { TestComponent0, TestComponent1 } from './util/components';
import { createEntities } from './util/helpers';
import { TestSystem0, TestSystem2 } from './util/systems';

const ENTITIES_COUNT = 1_000_000;
const TEST_ENTITIES_AMOUNT = 500;

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
  it('Should throw error if entities limit is exceeded', () => {
    {
      const world = new World(0);
      expect(() => world.createEntity()).toThrowError();
    }
    {
      const world = new World(1);
      world.createEntity();
      expect(() => world.createEntity()).toThrowError();
    }
    {
      const AMOUNT = 50;
      const world = new World(AMOUNT);
      expect(() => {
        for (let i = 0; i < AMOUNT + 1; i++) {
          world.createEntity();
        }
      }).toThrowError();
    }
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
  it('Should throw error for non-registered component', () => {
    const world = new World(ENTITIES_COUNT);

    expect(() => world.getComponentIndex(TestComponent0)).toThrow(
      `Component ${TestComponent0.name} is not registered`
    );
  });
  it('Should throw error for already registered component', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    expect(() => world.registerComponent(TestComponent0)).toThrowError();
  });
  it('removeEntities should remove array of entities', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    const ctors = [TestComponent0, TestComponent1];

    const entities = createEntities(world, ctors, TEST_ENTITIES_AMOUNT);

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
    const ctors = [TestComponent0, TestComponent1];

    createEntities(world, ctors, TEST_ENTITIES_AMOUNT);

    expect(world.entities).toHaveLength(TEST_ENTITIES_AMOUNT);
    world.clear();
    expect(world.entities).toHaveLength(0);
    expect(world.pool).toHaveLength(TEST_ENTITIES_AMOUNT);
  });
  it('World events', () => {
    const world = new World(ENTITIES_COUNT);

    let testValue = false;
    const callback = () => {
      testValue = true;
    };

    world.events.on('test-event', callback);
    expect(testValue).toEqual(false);
    world.events.emit('test-event', true);
    expect(testValue).toEqual(true);
    world.events.remove('test-event', callback);
    world.events.emit('test-event', false);
    expect(testValue).toEqual(true);
  });
  it('Can delete entities contained in the query object', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    const ctors = [TestComponent0, TestComponent1];
    const query = world.createQuery(ctors);

    createEntities(world, ctors, TEST_ENTITIES_AMOUNT);

    expect(world.entities).toHaveLength(TEST_ENTITIES_AMOUNT);
    expect(query.entities.size).toEqual(TEST_ENTITIES_AMOUNT);
    world.removeEntities(query.entities);
    expect(query.entities.size).toEqual(0);
    expect(world.entities).toHaveLength(0);
    expect(world.pool).toHaveLength(TEST_ENTITIES_AMOUNT);
  });
  it('Destroy whole world', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    const ctors = [TestComponent0, TestComponent1];
    const query = world.createQuery(ctors);
    world.addSystem(new TestSystem0());
    world.addSystem(new TestSystem2());

    createEntities(world, ctors, TEST_ENTITIES_AMOUNT);

    world.destroy();
    expect(query.entities.size).toEqual(0);
    expect(world.systems).toHaveLength(0);
    expect(world.entities).toHaveLength(0);
    expect(world.queries).toHaveLength(0);
  });
  it('Query filtered array of entities', () => {
    const world = new World(ENTITIES_COUNT);
    const TAG0 = 'test0';
    const TAG1 = 'test1';
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    world.registerTags([TAG0, TAG1]);
    const ctors0 = [TestComponent0];
    const ctors1 = [TestComponent0, TAG0];
    const entities0 = createEntities(world, ctors0, TEST_ENTITIES_AMOUNT);
    const entities1 = createEntities(world, ctors1, TEST_ENTITIES_AMOUNT);
    expect(entities0).toHaveLength(TEST_ENTITIES_AMOUNT);
    expect(entities1).toHaveLength(TEST_ENTITIES_AMOUNT);
    expect(world.queryEntities(ctors0)).toHaveLength(TEST_ENTITIES_AMOUNT * 2);
    expect(world.queryEntities(ctors1)).toHaveLength(TEST_ENTITIES_AMOUNT);
    expect(world.queryEntities([TAG1])).toHaveLength(0);
  });
  describe('Check is entity exist or not', () => {
    const world = new World(ENTITIES_COUNT);
    const entity0 = world.createEntity();
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();
    world.removeEntity(entity0);

    it('Should return true if exist,or false if not', () => {
      expect(world.hasEntity(entity0)).toBeFalsy();
      expect(world.hasEntity(555)).toBeFalsy();
      expect(world.hasEntity(entity1)).toBeTruthy();
      expect(world.hasEntity(entity2)).toBeTruthy();
    });
    it('Should throw error if entity does not exist and throwError flag is set', () => {
      expect(() => world.hasEntity(entity0, true)).toThrowError();
      expect(() => world.hasEntity(555, true)).toThrowError();
      expect(world.hasEntity(entity1, true)).toBeTruthy();
      expect(world.hasEntity(entity2, true)).toBeTruthy();
    });
  });
});
