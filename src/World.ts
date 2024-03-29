import FastBitSet from 'fastbitset';

import EventsEmitter from './EventsEmitter';
import { getEntityMask } from './Helpers';
import { Query } from './Query';
import QueryManager from './QueryManager';
import QueryMask from './QueryMask';
import SystemsManager from './SystemsManager';
import { Component, ComponentInstance, Components, Constructor, DebugData, System } from './types';

export const RESERVED_TAGS = {
  ALIVE: '_reserved_entity_alive_tag_',
  ALIVE_INDEX: 0,
  NAME: '_reserved_entity_name_tag_',
  NAME_INDEX: 1,
} as const;

export const RESERVED_MASK_INDICES = [RESERVED_TAGS.ALIVE_INDEX, RESERVED_TAGS.NAME_INDEX] as const;

export class World {
  public nextId = 0;

  public readonly pool: Array<number> = [];

  public readonly entities: Array<number> = [];

  public readonly components = Array<Array<unknown>>();

  public readonly masks: Array<FastBitSet> = [];

  public readonly queryManager: QueryManager;

  public readonly systemsManager = new SystemsManager();

  public readonly lookupTable: Int32Array;

  public readonly registeredComponents: Map<string, number> = new Map();

  public readonly events = new EventsEmitter();

  public readonly names = new Map<string, number>();

  public debugData: DebugData = {
    updateTime: 0,
    updateTimeDetailed: new Map(),
  };

  constructor(public entitiesMax: number) {
    this.lookupTable = new Int32Array(entitiesMax).fill(-1);
    this.registerTags([RESERVED_TAGS.ALIVE, RESERVED_TAGS.NAME]);
    this.queryManager = new QueryManager(this.entities, this.masks);
  }

  /**
   * Get entity components array
   *
   * @param entityId - entity id
   * @returns array of components
   */
  private getEntityComponents(entityId: number): Array<unknown> {
    let components = this.components[entityId];
    if (!components) {
      components = [];
      this.components[entityId] = components;
    }
    return components;
  }

  /**
   * Add value to mask and update queries
   *
   * @param entityId - entity id
   * @param index - bit index
   */
  private addToMask(entityId: number, index: number): void {
    getEntityMask(entityId, this.masks).add(index);
    this.queryManager.updateEntity(entityId);
  }

  /**
   * Remove value from mask and update queries
   *
   * @param entityId - entity id
   * @param index - bit index
   */
  private removeFromMask(entityId: number, index: number): void {
    const mask = getEntityMask(entityId, this.masks);
    mask.remove(index);
    this.queryManager.updateEntity(entityId);
    if (!mask.has(index)) {
      const components = this.getEntityComponents(entityId);
      components[index] = undefined;
    }
  }

  /**
   * Add tag to entity
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public addTag(entityId: number, ...tags: ReadonlyArray<string>): void {
    this.hasEntity(entityId, true);
    tags.forEach((tag) => {
      const tagIndex = this.getTagIndex(tag);
      const components = this.getEntityComponents(entityId);
      if (components[tagIndex]) {
        this.removeTag(entityId, tag);
      }
      components[tagIndex] = tag;
      this.addToMask(entityId, tagIndex);
    });
  }

  /**
   * Is entity has specific tag
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public hasTag(entityId: number, tag: string): boolean {
    this.hasEntity(entityId, true);
    const tagIndex = this.getTagIndex(tag);
    const components = this.getEntityComponents(entityId);
    return !!components[tagIndex];
  }

  /**
   * Remove tag from entity
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public removeTag(entityId: number, tag: string): void {
    this.hasEntity(entityId, true);
    const tagIndex = this.getTagIndex(tag);
    this.removeFromMask(entityId, tagIndex);
  }

  getIndex(component: Component): number {
    return typeof component === 'string'
      ? this.getTagIndex(component)
      : this.getComponentIndex(component);
  }

  /**
   *
   * @param componentName - component constructor name
   * @returns registered component index
   * @throws Will throw an error if component not registered
   *
   */
  getComponentIndex<T>(ctor: Constructor<T>): number {
    const index = this.registeredComponents.get(ctor.cachedComponentId);
    if (index === undefined) {
      throw new Error(`Component ${ctor.name} is not registered`);
    }
    return index;
  }

  /**
   * Get registered tag index
   *
   * @param tag - tag name
   * @returns registered tag index
   * @throws Will throw an error if tag not registered
   *
   */
  getTagIndex(tag: string): number {
    const index = this.registeredComponents.get(tag);
    if (index === undefined) {
      throw new Error(`Tag ${tag} is not registered`);
    }
    return index;
  }

  /**
   * Register component class
   *
   * @param component - component constructor
   */
  public registerComponent<T>(ctor: Constructor<T>): void {
    if (!this.registeredComponents.has(ctor.name)) {
      // eslint-disable-next-line no-param-reassign
      ctor.cachedComponentId = ctor.name;
      this.registeredComponents.set(ctor.name, this.registeredComponents.size);
    }
  }

  /**
   * Register multiple components
   *
   * @param constructors - components constructors
   */
  public registerComponents(constructors: ReadonlyArray<Constructor<unknown>>): void {
    constructors.forEach((ctor) => this.registerComponent(ctor));
  }

  /**
   * Register tags
   *
   * @param tags - array of tags
   */
  public registerTags(tags: ReadonlyArray<string>): void {
    let index = this.registeredComponents.size;
    tags.forEach((tag) => {
      if (this.registeredComponents.has(tag)) {
        throw Error(`Tag ${tag} already registered`);
      }
      this.registeredComponents.set(tag, index);
      index += 1;
    });
  }

  /**
   *
   * @param tag - tag name
   * @returns is tag exist in the world
   */
  public isTagExist(tag: string): boolean {
    return this.registeredComponents.has(tag);
  }

  /**
   * Get next free entity id
   *
   * @returns new entity id
   */
  private getNextId(): number {
    const index = this.pool.pop();
    // eslint-disable-next-line no-plusplus
    return index ?? this.nextId++;
  }

  /**
   *
   * @param components - array of components ctors or tags
   * @returns mask
   */
  private createQueryMask(components: Components): QueryMask {
    const indices: Array<number> = [...RESERVED_MASK_INDICES];
    const notIndices: Array<number> = [];

    components.forEach((component) => {
      if (typeof component === 'object') {
        notIndices.push(this.getIndex(component.component));
      } else {
        indices.push(this.getIndex(component));
      }
    });
    return new QueryMask(new FastBitSet(indices), new FastBitSet(notIndices));
  }

  /**
   * Query entities
   *
   * @param components - array of components ctors or tags
   * @returns array of entities filtered by mask
   */
  public queryEntities(components: Components): Array<number> {
    const queryMask = this.createQueryMask(components);
    return this.entities.filter((entityId) => queryMask.match(getEntityMask(entityId, this.masks)));
  }

  /**
   * Get queries by mask
   *
   * @param components - array of components ctors or tags
   * @returns array of queries
   */
  public getQueries(components: Components): Array<Query> {
    const queryMask = this.createQueryMask(components);
    const entry = this.queryManager.registry.get(queryMask.key);
    return entry ? Array.from(entry.queries) : [];
  }

  /**
   * Create query
   *
   * @param components - array of components ctors or tags
   * @returns Query object
   */
  public createQuery(components: Components, removeOnEmpty = false): Query {
    const queryMask = this.createQueryMask(components);
    return this.queryManager.createQuery(queryMask, removeOnEmpty);
  }

  /**
   * Remove query
   *
   * @param query - query object to remove
   */
  public removeQuery(query: Query): void {
    this.queryManager.removeQuery(query);
  }

  /**
   * Remove multiple queries
   *
   * @param components - array of components|tags
   */
  public removeQueries(components: Components): void {
    const queryMask = this.createQueryMask(components);
    this.queryManager.removeQueries(queryMask);
  }

  /**
   * @param name - entity name
   * @returns entity id
   */
  public getEntity(name: string): number | undefined {
    return this.names.get(name);
  }

  /**
   * Create entity
   *
   * @returns entity id
   */
  public createEntity(entityName?: string): number {
    const entityId = this.getNextId();
    if (entityId >= this.entitiesMax) {
      throw new Error(`Entities limit reached`);
    }
    if (entityName && this.names.has(entityName)) {
      throw new Error(`Entity with name ${entityName} already exist`);
    }
    const name = entityName || entityId.toString();
    this.lookupTable[entityId] = this.entities.length;
    this.masks[entityId] = new FastBitSet(RESERVED_MASK_INDICES);
    const components = this.getEntityComponents(entityId);
    components[RESERVED_TAGS.ALIVE_INDEX] = RESERVED_TAGS.ALIVE;
    components[RESERVED_TAGS.NAME_INDEX] = name;
    this.names.set(name, entityId);
    this.entities.push(entityId);
    return entityId;
  }

  /**
   * Remove all entities
   */
  public clear(): void {
    this.removeEntities([...this.entities]);
  }

  /**
   * Remove multiple entities from world
   *
   * @param entities - array of entities to remove
   */
  public removeEntities(entities: Array<number> | Set<number>): void {
    entities.forEach((entityId: number) => this.removeEntity(entityId));
  }

  /**
   * Query and remove entities from world
   *
   * @param components - array of components|tags
   */
  public removeEntitiesByMask(components: Components): void {
    const entities = this.queryEntities(components);
    this.removeEntities(entities);
  }

  /**
   * Remove entity from world and from all queries
   *
   * @param entityId - entity id
   * @throws will throw an error if entity does not exist
   */
  public removeEntity(entityId: number): void {
    this.hasEntity(entityId, true);
    const mask = getEntityMask(entityId, this.masks);
    mask.remove(RESERVED_TAGS.ALIVE_INDEX);
    this.queryManager.removeEntity(entityId);
    const components = this.getEntityComponents(entityId);
    const name = components[RESERVED_TAGS.NAME_INDEX] as string;
    this.names.delete(name);
    this.components[entityId] = [];
    mask.clear();
    const index = this.lookupTable[entityId] as number;
    const last = this.entities.pop();
    if (last !== undefined && index < this.entities.length) {
      this.entities[index] = last;
      this.lookupTable[last] = index;
    }
    this.lookupTable[entityId] = -1;
    this.pool.push(entityId);
  }

  /**
   *
   * @param entityId - entity id
   * @param throwError - throw error if does not exist
   * @returns is entity exist
   */
  public hasEntity(entityId: number, throwError = false): boolean {
    const isExist = this.lookupTable[entityId] !== -1;
    if (throwError && !isExist) {
      throw Error(`Entity ${entityId} does not exist`);
    }
    return isExist;
  }

  /**
   * Add component object to entity and update queries
   *
   * @param entityId - entity id
   * @param component - component class instance
   * @param forceAdd - add a component even if it exists
   * @returns - component instance
   * @throws will throw an error if entity does not exist
   * @throws will throw error if component exist
   */
  public addComponent<T>(
    entityId: number,
    component: ComponentInstance<T>,
    forceAdd = false,
  ): ComponentInstance<T> {
    this.hasEntity(entityId, true);
    if (typeof component !== 'object' || !component) {
      throw new Error(`Component is non class instance`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const ctor = Object.getPrototypeOf(component).constructor as Constructor<unknown>;
    const componentIndex = this.getComponentIndex(ctor);
    const mask = getEntityMask(entityId, this.masks);
    if (mask.has(componentIndex)) {
      if (!forceAdd) {
        throw new Error(`Entity ${entityId} already has component ${ctor.name}`);
      }
      this.removeFromMask(entityId, componentIndex);
    }
    const components = this.getEntityComponents(entityId);
    components[componentIndex] = component;
    this.addToMask(entityId, componentIndex);
    return component;
  }

  /**
   * Remove component object from entity and update queries
   *
   * @param entityId - entity id
   * @param ctor - component class constructor
   * @throws will throw an error if entity does not exist
   */
  public removeComponent<T>(entityId: number, ctor: Constructor<T>): void {
    this.hasEntity(entityId, true);
    const componentIndex = this.getComponentIndex(ctor);
    const mask = getEntityMask(entityId, this.masks);
    if (mask.has(componentIndex)) {
      this.removeFromMask(entityId, componentIndex);
    }
  }

  /**
   * Is entity has specific component
   *
   * @param entityId - entity id
   * @param ctor - class constructor
   * @returns true if component exist,or false if not
   * @throws will throw an error if entity does not exist
   */
  public hasComponent<T>(entityId: number, ctor: Constructor<T>): boolean {
    this.hasEntity(entityId, true);
    const componentIndex = this.getComponentIndex(ctor);
    const mask = getEntityMask(entityId, this.masks);
    return mask.has(componentIndex);
  }

  /**
   * Get component object by entity id
   *
   * @param entityId - entity id
   * @param ctor - component class constructor
   * @returns component class instance
   * @throws will throw an error if entity does not exist
   * @throws will throw an error if component does not exist
   */
  public getComponent<T>(entityId: number, ctor: Constructor<T>): T {
    this.hasEntity(entityId, true);
    const componentIndex = this.getComponentIndex(ctor);
    const components = this.getEntityComponents(entityId);
    const component = components[componentIndex];
    if (!component) {
      throw new Error(`Entity ${entityId} does not contain ${ctor.name}`);
    }
    return component as T;
  }

  /**
   * Create empty systems group(s)
   *
   * @param groups - groups
   * @throws Will throw an error if group already exist
   */
  public createGroups(groups: ReadonlyArray<{ name: string; disabled?: boolean }>): void {
    groups.forEach((group) => this.systemsManager.createGroup(group.name, group.disabled));
  }

  /**
   * Remove systems group
   *
   * @param groupName - group name
   */
  public removeGroup(groupName: string): void {
    this.systemsManager.removeGroup(groupName);
  }

  /**
   * disable systems group
   *
   * @param groupName - group name
   */
  public disableGroup(groupName: string): void {
    this.systemsManager.setGroupStatus(groupName, true);
  }

  /**
   * enable systems group
   *
   * @param groupName - group name
   */
  public enableGroup(groupName: string): void {
    this.systemsManager.setGroupStatus(groupName, false);
  }

  /**
   * Add system class instance to world
   *
   * @param system - system class instance
   * @param groupName - [optional] group name
   */
  public addSystem(system: System, groupName?: string): void {
    this.systemsManager.addSystem(system, groupName);
  }

  /**
   * Remove system from world
   *
   * @param ctor - system class constructor
   * @param groupName - [optional] group name
   */
  public removeSystem(ctor: Constructor<System>, groupName?: string): void {
    this.systemsManager.removeSystem(ctor, groupName);
  }

  /**
   * Remove all systems from world
   */
  public removeAllSystems(): void {
    this.systemsManager.dispose();
  }

  /**
   * Switch to debug mode
   */
  public enableDebugMode(): void {
    this.update = this.debugUpdate;
  }

  /**
   * Switch to normal mode(default)
   */
  public disableDebugMode(): void {
    this.update = this.normalUpdate;
  }

  private normalUpdate = (dt: number): void => {
    this.systemsManager.normalUpdate(dt);
  };

  private debugUpdate = (dt: number): void => {
    const updateTimeStart = performance.now();
    this.systemsManager.debugUpdate(dt, this.debugData.updateTimeDetailed);
    this.debugData.updateTime = performance.now() - updateTimeStart;
  };

  public update: (dt: number) => void = this.normalUpdate;

  /**
   * destroy whole world:
   * - remove all entities
   * - call exit for all systems
   * - remove systems
   */
  public destroy(): void {
    this.removeAllSystems();
    this.queryManager.dispose();
    this.clear();
  }
}
