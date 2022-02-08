import { RESERVED_MASK_INDICES, World } from '../src/World';
import { TestComponent0 } from './util/components';
import { TAGS, TEST_TAG0, TEST_TAG1, TEST_TAG2 } from './util/tags';

const ENTITIES_COUNT = 1_000;

describe('Tags tests', () => {
  it('Register tags', () => {
    const world = new World(ENTITIES_COUNT);
    const RESERVED_INDICES = RESERVED_MASK_INDICES.length;
    world.registerComponent(TestComponent0);
    world.registerTags(TAGS);
    expect(world.registeredComponents.get(TestComponent0.name)).toEqual(RESERVED_INDICES + 0);
    expect(world.registeredComponents.get(TEST_TAG0)).toEqual(RESERVED_INDICES + 1);
    expect(world.registeredComponents.get(TEST_TAG1)).toEqual(RESERVED_INDICES + 2);
    expect(world.registeredComponents.get(TEST_TAG2)).toEqual(RESERVED_INDICES + 3);
  });

  it('Add,remove and has tags', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);
    world.registerTags(TAGS);

    let value = 0;
    const query = world.createQuery([TestComponent0, TEST_TAG0, TEST_TAG1]).onAddSubscribe(() => {
      value += 1;
    });

    const entity = world.createEntity();
    world.addComponent(entity, new TestComponent0());
    world.addTag(entity, TEST_TAG0);
    expect(value).toBe(0);
    world.addTag(entity, TEST_TAG1);
    // entity added, value = 1
    expect(value).toBe(1);
    world.addTag(entity, TEST_TAG2);
    expect(value).toBe(1);
    // same tag added,onAdd callback invoked again, value = 2
    world.addTag(entity, TEST_TAG1);
    expect(value).toBe(2);

    world.removeTag(entity, TEST_TAG2);
    expect(world.hasTag(entity, TEST_TAG2)).not.toBeTruthy();
    expect(world.hasTag(entity, TEST_TAG0)).toBeTruthy();
    expect(world.hasTag(entity, TEST_TAG1)).toBeTruthy();

    query.onRemoveSubscribe(() => {
      value -= 1;
    });

    expect(value).toBe(2);
    world.removeTag(entity, TEST_TAG1);
    // entity removed from query,onRemove invoked, value = 1
    expect(value).toBe(1);
    world.removeTag(entity, TEST_TAG0);
    // entity not in query, value = 1
    expect(value).toBe(1);
  });

  it('createQuery must throw error if tag not registered', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerTags(TAGS);
    const tag = 'NotRegisteredTag';
    expect(() => world.createQuery(['tag0', tag])).toThrow(`Tag ${tag} is not registered`);
  });

  it('Add,remove, tag must throw error if tag not registered', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerTags(TAGS);
    const tag = 'NotRegisteredTag';
    const entity = world.createEntity();
    expect(() => world.addTag(entity, tag)).toThrow(`Tag ${tag} is not registered`);
    expect(() => world.removeTag(entity, tag)).toThrow(`Tag ${tag} is not registered`);
    expect(() => world.hasTag(entity, tag)).toThrow(`Tag ${tag} is not registered`);
  });

  it('Should throw error for already registered tag', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerTags(TAGS);
    expect(() => world.registerTags([TEST_TAG0])).toThrow();
  });

  it('Is tag exist check', () => {
    const world = new World(ENTITIES_COUNT);
    expect(world.isTagExist(TEST_TAG0)).toBeFalsy();
    world.registerTags(TAGS);
    expect(world.isTagExist(TEST_TAG0)).toBeTruthy();
  });

  it('Should accept multiple tags', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerTags(TAGS);
    const entity = world.createEntity();
    world.addTag(entity, ...TAGS);
    expect(world.hasTag(entity, TEST_TAG0)).toBeTruthy();
    expect(world.hasTag(entity, TEST_TAG1)).toBeTruthy();
    expect(world.hasTag(entity, TEST_TAG2)).toBeTruthy();
  });
});
