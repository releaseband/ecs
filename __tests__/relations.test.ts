/* eslint-disable @typescript-eslint/dot-notation */
import { TAG_CHILDREN_INDEX, TAG_PARENT_INDEX, World } from '../src/World';
import { TestComponent0 } from './util/components';

const ENTITIES_COUNT = 1_000_000;

describe('Relation tests', () => {
  it('Should add child to parent', () => {
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
    const childChildren = world.getChildren(child);
    expect(childChildren.size).toBe(0);

    world.removeEntity(parent);

    expect(world.hasEntity(child)).toBeFalsy();
  });

  it('Should add multiple child entities', () => {
    const world = new World(ENTITIES_COUNT);

    const parent = world.createEntity();

    const child0 = world.createChildEntity(parent);
    const child1 = world.createChildEntity(parent);
    const child2 = world.createChildEntity(parent);
    const child3 = world.createChildEntity(parent);

    world.removeEntity(parent);

    expect(world.hasEntity(child0)).toBeFalsy();
    expect(world.hasEntity(child1)).toBeFalsy();
    expect(world.hasEntity(child2)).toBeFalsy();
    expect(world.hasEntity(child3)).toBeFalsy();
  });

  it('Should run query callback', () => {
    const world = new World(ENTITIES_COUNT);
    world.registerComponent(TestComponent0);

    let isRemoved = false;

    const parent = world.createEntity();
    const child = world.createChildEntity(parent);
    world.addComponent(child, new TestComponent0());

    world.createQuery([TestComponent0]).onRemoveSubscribe(() => {
      isRemoved = true;
    });

    world.removeEntity(parent);

    expect(world.hasEntity(child)).toBeFalsy();
    expect(isRemoved).toBeTruthy();
  });
});
