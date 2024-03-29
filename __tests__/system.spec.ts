/* eslint-disable @typescript-eslint/dot-notation */
import { describe, expect, it } from 'vitest';

import { DEFAULT_GROUP_NAME } from '../src';
import { World } from '../src/World';
import { TestSystem0, TestSystem1, TestSystem2 } from './util/systems';
import SystemForEnableDisableTest from './util/systems/SystemForEnableDisableTest';

const ENTITIES_COUNT = 1_000_000;
const TEST_GROUP0 = 'test_group0';
const TEST_GROUP1 = 'test_group1';

describe('System tests', () => {
  it('Add system', () => {
    const world = new World(ENTITIES_COUNT);

    const system = new TestSystem0();
    world.addSystem(system);

    expect(world.systemsManager['groups']).toHaveLength(1);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)).toBeDefined();
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toHaveLength(1);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toContain(system);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.disabled).toBeFalsy();
  });

  it('Add multiple systems', () => {
    const world = new World(ENTITIES_COUNT);

    const system0 = new TestSystem0();
    const system1 = new TestSystem1();
    world.addSystem(system0);
    world.addSystem(system1);

    expect(world.systemsManager['groups']).toHaveLength(1);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)).toBeDefined();
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toHaveLength(2);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toContain(system0);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toContain(system1);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.disabled).toBeFalsy();
  });

  it('Iterate through systems and call Update method', () => {
    const world = new World(ENTITIES_COUNT);
    const system0 = new TestSystem0();
    const system1 = new TestSystem1();
    world.addSystem(system0);
    world.addSystem(system1);

    world.update(1);

    expect(system0.testValue).toBe(1);
    expect(system1.testValue).toBe(1);
  });

  it('Remove system instance from world', () => {
    const world = new World(ENTITIES_COUNT);
    const system0 = new TestSystem0();
    const system1 = new TestSystem1();
    world.addSystem(system0);
    world.addSystem(system1);

    world.update(1);

    expect(system0.testValue).toBe(1);
    expect(system1.testValue).toBe(1);

    world.removeSystem(TestSystem0);
    world.removeSystem(TestSystem1);

    world.update(2);

    expect(system0.testValue).toBe(1);
    expect(system1.testValue).toBe(1);
    expect(world.systemsManager['groups']).toHaveLength(1);
    expect(world.systemsManager['groups'].get(DEFAULT_GROUP_NAME)?.systems).toHaveLength(0);
  });

  it('Update can be optional', () => {
    const world = new World(ENTITIES_COUNT);
    const system = new TestSystem2();
    world.addSystem(system);
    world.update(1);
    expect(system.testValue).toBeNull();
  });

  it('Should call Exit method if system removed', () => {
    const world = new World(ENTITIES_COUNT);
    const system = new TestSystem2();
    world.addSystem(system);
    expect(system.testValue).toBeNull();
    world.removeSystem(TestSystem2);
    expect(system.testValue).toBe(12345);
  });

  it('Remove all systems from world', () => {
    const world = new World(ENTITIES_COUNT);
    const systemWithExit = new TestSystem2();
    world.addSystem(new TestSystem0());
    world.addSystem(new TestSystem1());
    world.addSystem(systemWithExit);
    world.removeAllSystems();
    expect(world.systemsManager['groups']).toHaveLength(0);
    expect(systemWithExit.testValue).toBe(12345);
  });

  describe('Groups', () => {
    it('Create group', () => {
      const world = new World(ENTITIES_COUNT);
      const system0 = new TestSystem0();
      world.createGroups([{ name: TEST_GROUP0 }]);
      world.addSystem(system0, TEST_GROUP0);
      expect(world.systemsManager['groups'].has(TEST_GROUP0)).toBeTruthy();
      expect(world.systemsManager['groups'].get(TEST_GROUP0)?.systems).toHaveLength(1);
    });

    it('Multiple groups', () => {
      const world = new World(ENTITIES_COUNT);
      const system0 = new TestSystem0();
      world.createGroups([{ name: TEST_GROUP0 }, { name: TEST_GROUP1 }]);
      world.addSystem(system0, TEST_GROUP0);
      world.addSystem(system0, TEST_GROUP1);
      expect(world.systemsManager['groups'].has(TEST_GROUP0)).toBeTruthy();
      expect(world.systemsManager['groups'].has(TEST_GROUP1)).toBeTruthy();
      expect(world.systemsManager['groups'].get(TEST_GROUP0)?.systems).toHaveLength(1);
      expect(world.systemsManager['groups'].get(TEST_GROUP1)?.systems).toHaveLength(1);
    });

    it('Update', () => {
      const world = new World(ENTITIES_COUNT);
      const system0 = new TestSystem0();
      const system1 = new TestSystem1();
      world.createGroups([{ name: TEST_GROUP0 }, { name: TEST_GROUP1 }]);
      world.addSystem(system0, TEST_GROUP0);
      world.addSystem(system1, TEST_GROUP1);
      world.update(1);
      expect(system0.testValue).toBe(1);
      expect(system1.testValue).toBe(1);
    });

    it('Remove group', () => {
      const world = new World(ENTITIES_COUNT);
      const system0 = new TestSystem0();
      const system1 = new TestSystem1();
      world.createGroups([{ name: TEST_GROUP0 }, { name: TEST_GROUP1 }]);
      world.addSystem(system0, TEST_GROUP0);
      world.addSystem(system1, TEST_GROUP1);
      world.update(1);
      expect(system0.testValue).toBe(1);
      expect(system1.testValue).toBe(1);
      world.removeGroup(TEST_GROUP0);
      world.update(2);
      expect(system0.testValue).toBe(1);
      expect(system1.testValue).toBe(2);
    });

    it('Dispose should remove all systems and groups', () => {
      const world = new World(ENTITIES_COUNT);
      const system0 = new TestSystem0();
      const system1 = new TestSystem1();
      world.createGroups([{ name: TEST_GROUP0 }]);
      world.addSystem(system0, TEST_GROUP0);
      world.addSystem(system1);
      world.update(1);
      expect(system0.testValue).toBe(1);
      world.systemsManager.dispose();
      world.update(2);
      expect(system0.testValue).toBe(1);
      expect(system1.testValue).toBe(1);
    });

    it('Should enable and disable group', () => {
      const world = new World(ENTITIES_COUNT);
      const system = new TestSystem0();
      world.addSystem(system);
      world.update(1);
      expect(system.testValue).toBe(1);
      world.disableGroup(DEFAULT_GROUP_NAME);
      world.update(2);
      expect(system.testValue).not.toBe(2);
      world.enableGroup(DEFAULT_GROUP_NAME);
      world.update(3);
      expect(system.testValue).toBe(3);
    });
  });

  it('Should call enable and disable method', () => {
    const world = new World(ENTITIES_COUNT);
    const system = new SystemForEnableDisableTest();
    world.addSystem(system);
    expect(system.isEnabled).toBeTruthy();
    world.disableGroup(DEFAULT_GROUP_NAME);
    expect(system.isEnabled).toBeFalsy();
    world.enableGroup(DEFAULT_GROUP_NAME);
    expect(system.isEnabled).toBeTruthy();
  });
});
