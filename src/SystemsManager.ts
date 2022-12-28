import { System } from './System';
import { Constructor } from './types';

export type Group = {
  disabled: boolean;
  systems: Array<System>;
};

const remove = (system: System, name?: string): boolean => {
  const isExist = !name || system.constructor.name === name;
  if (isExist && system.exit) {
    system.exit();
  }
  return !isExist;
};

const update = (systems: Array<System>, dt: number): void => {
  systems.forEach((system) => {
    if (system.update) {
      system.update(dt);
    }
  });
};

export default class SystemsManager {
  private readonly groups = new Map<string, Group>();

  private systems: Array<System> = [];

  /**
   * Get systems group if exist
   *
   * @param groupName - group name
   * @returns systems group
   * @throws should throw an error if group not exist
   */
  private getGroup(groupName: string): Group {
    const group = this.groups.get(groupName);
    if (!group) {
      throw new Error(`Group ${groupName} not found`);
    }
    return group;
  }

  /**
   * Create empty systems group
   *
   * @param groupName - group name
   * @throws Will throw an error if group already exist
   */
  public createGroup(groupName: string): void {
    if (this.groups.has(groupName)) {
      throw new Error(`Group ${groupName} already exist`);
    }
    this.groups.set(groupName, {
      disabled: false,
      systems: [],
    });
  }

  /**
   * Add system class instance to world
   *
   * @param system - system class instance
   * @param groupName - [optional] group name
   * @returns system
   * @throws Will throw an error if group not found
   */
  public addSystem<T extends System>(system: T, groupName?: string): T {
    if (groupName) {
      const group = this.getGroup(groupName);
      group.systems.push(system);
    } else {
      this.systems.push(system);
    }
    return system;
  }

  /**
   * Remove system from group and call system.exit method
   *
   * @param ctor - system class constructor
   */
  public removeSystem(ctor: Constructor<System>, groupName?: string): void {
    if (groupName) {
      const group = this.getGroup(groupName);
      group.systems = group.systems.filter((system) => remove(system, ctor.name));
    } else {
      this.systems = this.systems.filter((system) => remove(system, ctor.name));
    }
  }

  /**
   * Remove all systems from group
   *
   * @param groupName - group name
   *
   */
  public removeGroup(groupName: string): void {
    const group = this.getGroup(groupName);
    group.systems.forEach((system) => {
      if (system.exit) {
        system.exit();
      }
    });
    group.systems.length = 0;
  }

  /**
   * Iterate through groups/systems and call update method on each system
   *
   * see {@link System}
   *
   * @param dt - delta time
   */
  public normalUpdate(dt: number): void {
    this.groups.forEach((group) => update(group.systems, dt));
    update(this.systems, dt);
  }

  /**
   * Iterate through systems, call update and store execution time
   *
   * see {@link System}
   *
   * @param dt - delta time
   */
  public debugUpdate(dt: number, data: Map<string, number>): void {
    this.groups.forEach((group, groupName) =>
      group.systems.forEach((system) => {
        if (system.update) {
          const start = performance.now();
          system.update(dt);
          data.set(`${groupName}_${system.constructor.name}`, performance.now() - start);
        }
      }),
    );
    this.systems.forEach((system) => {
      if (system.update) {
        const start = performance.now();
        system.update(dt);
        data.set(system.constructor.name, performance.now() - start);
      }
    });
  }

  /**
   * Remove all groups and release resources
   */
  public dispose(): void {
    this.groups.forEach((_group, groupName) => this.removeGroup(groupName));
    this.groups.clear();
    this.systems.forEach((system) => remove(system));
    this.systems.length = 0;
  }
}
