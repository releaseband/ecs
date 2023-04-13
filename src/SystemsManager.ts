import { Constructor, DEFAULT_GROUP_NAME, Group, System } from './types';

const update = (group: Group, dt: number): void => {
  if (group.disabled) return;
  group.systems.forEach((system) => {
    if (system.update) {
      system.update(dt);
    }
  });
};

export default class SystemsManager {
  private readonly groups = new Map<string, Group>();

  constructor() {
    this.createGroup(DEFAULT_GROUP_NAME);
  }

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
  public createGroup(groupName: string, disabled = false): void {
    if (this.groups.has(groupName)) {
      throw new Error(`Group ${groupName} already exist`);
    }
    this.groups.set(groupName, {
      disabled,
      systems: [],
    });
  }

  /**
   * Add system class instance to world
   *
   * @param system - system class instance
   * @param groupName - [optional] group name
   * @throws Will throw an error if group not found
   */
  public addSystem(system: System, groupName = DEFAULT_GROUP_NAME): void {
    const group = this.getGroup(groupName);
    group.systems.push(system);
  }

  /**
   * Remove system from group and call system.exit method
   *
   * @param ctor - system class constructor
   * @param groupName - group name [optional]
   */
  public removeSystem(ctor: Constructor<System>, groupName?: string): void {
    this.groups.forEach((group, name) => {
      if (groupName && groupName !== name) return;
      // eslint-disable-next-line no-param-reassign
      group.systems = group.systems.filter((system) => {
        const isExist = system.constructor.name === ctor.name;
        if (isExist && system.exit) system.exit();
        return !isExist;
      });
    });
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
      if (system.exit) system.exit();
    });
    group.systems.length = 0;
  }

  /**
   * disable or enable single group
   *
   * @param groupName - group name
   */
  public setGroupStatus(groupName: string, isDisabled: boolean): void {
    const group = this.getGroup(groupName);
    group.disabled = isDisabled;
    group.systems.forEach((system) => {
      if (group.disabled && system.disable) system.disable();
      if (!group.disabled && system.enable) system.enable();
    });
  }

  /**
   * Iterate through groups/systems and call update method on each system
   *
   * see {@link System}
   *
   * @param dt - delta time
   */
  public normalUpdate(dt: number): void {
    this.groups.forEach((group) => update(group, dt));
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
        if (!system.update) return;
        const start = performance.now();
        system.update(dt);
        const end = performance.now() - start;
        data.set(`${groupName}_${system.constructor.name}`, end);
      }),
    );
  }

  /**
   * Remove all groups and release resources
   */
  public dispose(): void {
    this.groups.forEach((_group, groupName) => this.removeGroup(groupName));
    this.groups.clear();
  }
}
