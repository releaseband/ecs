import { RESERVED_MASK_INDICES, RESERVED_TAGS, World } from '../src/World';
import {
  TestComponent0,
  TestComponent1,
  TestComponent2,
} from './util/components';

const ENTITIES_COUNT = 1_000_000;

describe('Entities tests', () => {
  it('Create and remove entity', () => {
    const world = new World(ENTITIES_COUNT);
    const entity = world.createEntity();
    const name = entity.toString();
    expect(entity).toBe(0);
    // lookup for fast access
    expect(world.lookupTable[entity]).toBe(0);
    // init bitset
    expect(world.masks[entity]).toBeDefined();
    // set bits for reserved tags
    expect(world.masks[entity]?.size()).toEqual(RESERVED_MASK_INDICES.length);
    expect(world.masks[entity]?.has(RESERVED_TAGS.ALIVE_INDEX)).toBeTruthy();
    expect(world.masks[entity]?.has(RESERVED_TAGS.NAME_INDEX)).toBeTruthy();
    // set reserved tags values
    expect(world.components[entity]).toBeDefined();
    expect(world.components[entity]).toHaveLength(RESERVED_MASK_INDICES.length);
    // set default unique name(entityId as string)
    expect(world.names.has(name)).toBeTruthy();
    // is name exist
    expect(world.getEntity(name)).toEqual(entity);

    world.removeEntity(entity);
    // remove from entities list
    expect(world.entities[entity]).toBeUndefined();
    // remove from lookup table name=>id
    expect(world.names.has(name)).toBeFalsy();
    expect(world.getEntity(name)).toBeUndefined();
    // clear bitset on remove
    expect(world.masks[entity]?.has(RESERVED_TAGS.ALIVE_INDEX)).toBeFalsy();
    expect(world.masks[entity]?.has(RESERVED_TAGS.NAME_INDEX)).toBeFalsy();
    // empty components
    expect(world.components[entity]).toHaveLength(0);
  });

  it('Create and remove named entity', () => {
    const world = new World(ENTITIES_COUNT);
    const name = 'TEST_NAME';
    const entity = world.createEntity('TEST_NAME');
    expect(entity).toBe(0);
    expect(world.lookupTable[entity]).toBe(0);
    expect(world.masks[entity]).toBeDefined();
    expect(world.masks[entity]?.size()).toEqual(RESERVED_MASK_INDICES.length);
    expect(world.components[entity]).toBeDefined();
    expect(world.components[entity]).toHaveLength(RESERVED_MASK_INDICES.length);
    expect(world.masks[entity]?.has(RESERVED_TAGS.ALIVE_INDEX)).toBeTruthy();
    expect(world.masks[entity]?.has(RESERVED_TAGS.NAME_INDEX)).toBeTruthy();
    expect(world.names.has(name)).toBeTruthy();
    expect(world.getEntity(name)).toEqual(entity);

    world.removeEntity(entity);
    expect(world.entities[entity]).toBeUndefined();
    expect(world.names.has(name)).toBeFalsy();
    expect(world.masks[entity]?.has(RESERVED_TAGS.ALIVE_INDEX)).toBeFalsy();
    expect(world.masks[entity]?.has(RESERVED_TAGS.NAME_INDEX)).toBeFalsy();
    expect(world.components[entity]).toHaveLength(0);
    expect(world.getEntity(name)).toBeUndefined();
  });

  it('Should throw error if entity with this name exist', () => {
    const world = new World(ENTITIES_COUNT);
    const name = 'TEST_NAME';
    world.createEntity('TEST_NAME');
    expect(() => world.createEntity('TEST_NAME')).toThrow(
      `Entity with name ${name} already exist`
    );
  });

  it('Create multiple entity', () => {
    const world = new World(ENTITIES_COUNT);
    const entities: Array<number> = [];
    const count = 5;

    for (let i = 0; i < count; i += 1) {
      const entity = world.createEntity();
      expect(entity).toEqual(i);
      expect(world.masks[entity]?.size()).toEqual(RESERVED_MASK_INDICES.length);
      expect(world.lookupTable[i]).not.toEqual(-1);
      entities.push(entity);
    }

    entities.forEach((entity, index) => {
      world.removeEntity(entity);
      expect(world.pool).toContain(entity);
      expect(world.lookupTable[index]).toEqual(-1);
    });

    expect(world.pool).toEqual(expect.arrayContaining(entities));
  });

  it('Create and Remove entity', () => {
    const world = new World(ENTITIES_COUNT);
    const entity0 = world.createEntity();
    world.removeEntity(entity0);
    expect(world.pool).toEqual([0]);
    const entity1 = world.createEntity();
    expect(entity1).toBe(0);
    expect(world.pool).toHaveLength(0);
  });

  it('Should throw error on remove if entity not exist', () => {
    const world = new World(ENTITIES_COUNT);
    const entityId = 555;
    expect(() => world.removeEntity(entityId)).toThrow(
      `Entity ${entityId} does not exist`
    );
  });

  it('Add component', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const entity = world.createEntity();

    const component = new TestComponent0();
    const componentIndex = world.getComponentIndex(TestComponent0);
    world.addComponent(entity, component);
    expect(world.components[entity]).toHaveLength(
      RESERVED_MASK_INDICES.length + 1
    );
    expect(world.components[entity]?.[componentIndex]).toEqual(component);
    expect(world.masks[entity]?.has(componentIndex)).toBe(true);
  });

  it('Add multiple components', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    world.registerComponent(TestComponent2);
    const components = [TestComponent0, TestComponent1, TestComponent2];
    const entity = world.createEntity();

    components.forEach((Ctor) => {
      const component = new Ctor();
      const componentIndex = world.getComponentIndex(Ctor);
      world.addComponent(entity, component);
      expect(world.components[entity]?.[componentIndex]).toEqual(component);
      expect(world.masks[entity]?.has(componentIndex)).toBe(true);
    });
  });

  it('Add and remove single component', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const entity = world.createEntity();
    const component0 = new TestComponent0();
    const componentIndex = world.getComponentIndex(TestComponent0);
    world.addComponent(entity, component0);
    expect(world.components[entity]?.[componentIndex]).toEqual(component0);
    expect(world.masks[entity]?.has(componentIndex)).toBe(true);
    world.removeComponent(entity, TestComponent0);
    expect(world.components[entity]?.[componentIndex]).toBeUndefined();
    expect(world.masks[entity]?.has(componentIndex)).toBe(false);
  });

  it('Add and remove multiple', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    world.registerComponent(TestComponent2);
    const components = [TestComponent0, TestComponent1, TestComponent2];
    const entity = world.createEntity();

    components.forEach((Ctor) => world.addComponent(entity, new Ctor()));

    components.forEach((ctor) => {
      const componentIndex = world.getComponentIndex(ctor);
      world.removeComponent(entity, ctor);
      expect(world.components[entity]?.[componentIndex]).toBeUndefined();
      expect(world.masks[entity]?.has(componentIndex)).toBe(false);
    });
    expect(world.masks[entity]?.size()).toEqual(RESERVED_MASK_INDICES.length);
  });

  it('Get component', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent0(555));

    const component0 = world.getComponent(entity, TestComponent0);
    expect(component0).toBeDefined();
    expect(component0.value).toBe(555);
    component0.value = 777;
    const component1 = world.getComponent(entity, TestComponent0);
    expect(component1).toBeDefined();
    expect(component1.value).toBe(777);
  });

  it('Shared component', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const component = new TestComponent0(555);
    const componentIndex = world.getComponentIndex(TestComponent0);

    for (let i = 0; i < 5; i += 1) {
      const entity = world.createEntity();
      world.addComponent(entity, component);
      expect(world.components[entity]?.[componentIndex]).toEqual(component);
    }
    component.value = 777;
    world.queryEntities([TestComponent0]).forEach((entity) => {
      const data = world.getComponent(entity, TestComponent0);
      expect(data.value).toBe(777);
    });
  });

  it('Multiple add/get', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerComponent(TestComponent1);
    world.registerComponent(TestComponent2);
    const components = [TestComponent0, TestComponent1, TestComponent2];
    const entity = world.createEntity();

    components.forEach((Ctor, i) => {
      world.addComponent(entity, new Ctor(i));
    });

    components.forEach((ctor, i) => {
      const component = world.getComponent(entity, ctor);
      expect(component.value).toEqual(i);
    });
  });

  it('Get component before/after add', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const entity = world.createEntity();

    const shouldBeUndefined = world.getComponent(entity, TestComponent0);
    expect(shouldBeUndefined).toBeUndefined();
    world.addComponent(entity, new TestComponent0());
    const shouldBeDefined = world.getComponent(entity, TestComponent0);
    expect(shouldBeDefined).toBeDefined();
    world.removeComponent(entity, TestComponent0);
    const shouldBeUndefinedAgain = world.getComponent(entity, TestComponent0);
    expect(shouldBeUndefinedAgain).toBeUndefined();
  });

  it('Check for entity component exist or not', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    const entity = world.createEntity();
    expect(world.hasComponent(entity, TestComponent0)).toBe(false);
    world.addComponent(entity, new TestComponent0());
    expect(world.hasComponent(entity, TestComponent0)).toBe(true);
  });

  it('Must throw error if used non-registered component', () => {
    const world = new World(ENTITIES_COUNT);

    const component = new TestComponent1();
    const entity = world.createEntity();
    expect(() => world.addComponent(entity, component)).toThrow(
      `Component ${component.constructor.name} is not registered`
    );
  });

  it('Add component must return component instance', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent1);
    const entity = world.createEntity();
    const component = world.addComponent(entity, new TestComponent1(12345));
    expect(component).toBeDefined();
    expect(world.getComponent(entity, TestComponent1)).toEqual(component);
  });

  it('Should throw error if entity does not exist', () => {
    const world = new World(ENTITIES_COUNT);
    const TAG = 'tag';
    world.registerComponent(TestComponent0);
    world.registerTags([TAG]);

    const entity = 555;
    const errorMsg = `Entity ${entity} does not exist`;

    expect(() => world.hasTag(entity, TAG)).toThrow(errorMsg);
    expect(() => world.addTag(entity, TAG)).toThrow(errorMsg);
    expect(() => world.removeTag(entity, TAG)).toThrow(errorMsg);

    expect(() => world.hasComponent(entity, TestComponent0)).toThrow(errorMsg);
    expect(() => world.getComponent(entity, TestComponent0)).toThrow(errorMsg);
    expect(() => world.addComponent(entity, new TestComponent0())).toThrow(
      errorMsg
    );
    expect(() => world.addComponent(entity, new TestComponent0())).toThrow(
      errorMsg
    );
  });

  it('Should throw error if component already exist', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);

    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent0());
    expect(() => world.addComponent(entity, new TestComponent0())).toThrow();
  });
});
