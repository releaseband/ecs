/* eslint-disable @typescript-eslint/dot-notation */
import { TAG_CHILDREN_INDEX, TAG_PARENT_INDEX, World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

describe('Relation tests', () => {
  it('Should add child to parent and vice versa', () => {
    const world = new World(ENTITIES_COUNT);

    const parent = world.createEntity();
    const child = world.createChildEntity(parent);

    expect(world.masks[parent]?.has(TAG_CHILDREN_INDEX)).toBeTruthy();
    expect(world.masks[parent]?.has(TAG_PARENT_INDEX)).toBeTruthy();
    expect(world.masks[child]?.has(TAG_CHILDREN_INDEX)).toBeTruthy();
    expect(world.masks[child]?.has(TAG_PARENT_INDEX)).toBeTruthy();

    expect(world['getEntityComponents'](parent)[TAG_PARENT_INDEX]).toBeNull();
    expect(world['getEntityComponents'](child)[TAG_PARENT_INDEX]).toBe(parent);

    expect(world.getParent(parent)).toBeNull();
    expect(world.getParent(child)).toBe(0);

    const parentChildren = world.getChildren(parent);
    expect(parentChildren.size).toBe(1);
    expect(parentChildren.has(child)).toBeTruthy();

    const childChildren = world.getChildren(child);
    expect(childChildren.size).toBe(0);

    world.removeEntity(parent);

    expect(world.getParent(child)).toBeNull();
  });

  it('Should add multiple child entities', () => {
    const world = new World(ENTITIES_COUNT);

    const parent = world.createEntity();

    const child0 = world.createChildEntity(parent);
    const child1 = world.createChildEntity(parent);
    const child2 = world.createChildEntity(parent);
    const child3 = world.createChildEntity(parent);
    const children = [child0, child1, child2, child3];

    const parentChildren = world.getChildren(parent);
    expect(parentChildren.size).toBe(children.length);
    expect(parentChildren).toEqual(new Set(children));

    world.removeEntity(parent);

    expect(world.getParent(child0)).toBeFalsy();
    expect(world.getParent(child1)).toBeFalsy();
    expect(world.getParent(child2)).toBeFalsy();
    expect(world.getParent(child3)).toBeFalsy();
  });

  it('Should remove child from parent entity set', () => {
    const world = new World(ENTITIES_COUNT);

    const parent = world.createEntity();

    const child0 = world.createChildEntity(parent);
    const child1 = world.createChildEntity(parent);
    const child2 = world.createChildEntity(parent);
    const child3 = world.createChildEntity(parent);
    [child0, child1, child2, child3].forEach((child) => {
      expect(world.getChildren(parent).has(child)).toBeTruthy();
      world.removeEntity(child);
      expect(world.getChildren(parent).has(child)).toBeFalsy();
    });

    const parentChildren = world.getChildren(parent);
    expect(parentChildren.size).toBe(0);
  });

  it('Should throw error if parent entity not exist', () => {
    const world = new World(ENTITIES_COUNT);
    expect(() => world.createChildEntity(123)).toThrow();
  });

  it('Should throw error on get parent if child entity not exist', () => {
    const world = new World(ENTITIES_COUNT);
    expect(() => world.getParent(123)).toThrow();
  });

  it('Should throw error on get children if parent entity not exist', () => {
    const world = new World(ENTITIES_COUNT);
    expect(() => world.getChildren(123)).toThrow();
  });
});
