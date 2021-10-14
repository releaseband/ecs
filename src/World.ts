import FastBitSet from 'fastbitset';
import { EventsEmitter } from './EventsEmitter';
import { Constructor } from './Helpers';
import { Query } from './Query';
import { System } from './System';

export const RESERVED_TAGS = {
  ALIVE: '_reserved_entity_alive_tag_',
  ALIVE_INDEX: 0,
  NAME: '_reserved_entity_name_tag_',
  NAME_INDEX: 1,
} as const;

export const RESERVED_MASK_INDICES = [
  RESERVED_TAGS.ALIVE_INDEX,
  RESERVED_TAGS.NAME_INDEX,
] as const;

export class World {
  nextId = 0;
  pool = Array<number>();
  entities = Array<number>();
  components: Array<Array<unknown>> = [];
  masks: FastBitSet[] = [];
  queries = Array<Query>();
  lookupTable: Int32Array = new Int32Array(this.entitiesMax).fill(-1);
  registeredComponents: { [componentName: string]: number } = {};
  systems = Array<System>();
  events: EventsEmitter = new EventsEmitter();
  names = new Map<string, number>();

  constructor(public entitiesMax: number) {
    this.registerTags([RESERVED_TAGS.ALIVE, RESERVED_TAGS.NAME]);
  }

  /**
   * Add value to mask and update queries
   *
   * @param entityId - entity id
   * @param index - bit index
   */
  private addToMask(entityId: number, index: number): void {
    const mask = this.masks[entityId];
    mask.add(index);
    for (const query of this.queries) {
      if (!query.entities.has(entityId)) {
        const diff = query.mask.difference_size(mask);
        if (diff === 0) {
          query.add(entityId);
        }
      }
    }
  }

  /**
   * Remove value from mask and update queries
   *
   * @param entityId - entity id
   * @param index - bit index
   */
  private removeFromMask(entityId: number, index: number): void {
    this.masks[entityId].remove(index);
    for (const query of this.queries) {
      if (query.entities.has(entityId)) {
        const diff = query.mask.difference_size(this.masks[entityId]);
        if (diff !== 0) {
          query.remove(entityId);
        }
        if (query.removeOnEmpty && !query.entities.size) {
          this.removeQuery(query);
        }
      }
    }
    this.components[entityId][index] = undefined;
  }

  /**
   * Add tag to entity
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public addTag(entityId: number, tag: string): void {
    const tagIndex = this.getTagIndex(tag);
    if (this.components[entityId][tagIndex]) {
      this.removeTag(entityId, tag);
    }
    this.components[entityId][tagIndex] = tag;
    this.addToMask(entityId, tagIndex);
  }

  /**
   * Is entity has specific tag
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public hasTag(entityId: number, tag: string): boolean {
    const tagIndex = this.getTagIndex(tag);
    return !!this.components[entityId][tagIndex];
  }

  /**
   * Remove tag from entity
   *
   * @param entityId - entity id
   * @param tag - tag name
   */
  public removeTag(entityId: number, tag: string): void {
    const tagIndex = this.getTagIndex(tag);
    this.removeFromMask(entityId, tagIndex);
  }

  /**
   * Register tags
   *
   * @param tags - array of tags
   */
  public registerTags(tags: string[]): void {
    let index = Object.keys(this.registeredComponents).length;
    tags.forEach((tag) => {
      if (!this.registeredComponents[tag]) {
        this.registeredComponents[tag] = index;
        index += 1;
      }
    });
  }

  /**
   *
   * @param componentName - component constructor name
   * @returns registered component index
   * @throws Will throw an error if component not registered
   *
   */
  getComponentIndex<T>(ctor: Constructor<T>): number {
    const index = this.registeredComponents[ctor.cachedComponentId];
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
    const index = this.registeredComponents[tag];
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
    if (!this.registeredComponents[ctor.name]) {
      ctor.cachedComponentId = ctor.name;
      const index = Object.keys(this.registeredComponents).length;
      this.registeredComponents[ctor.name] = index;
    }
  }

  /**
   * Get next free entity id
   *
   * @returns new entity id
   */
  private getNextId(): number {
    const index = this.pool.pop();
    return index ?? this.nextId++;
  }

  /**
   *
   * @param components - array of components ctors or tags
   * @returns mask
   */
  private getMask(components: (Constructor<unknown> | string)[]): FastBitSet {
    const indices: number[] = [...RESERVED_MASK_INDICES];
    for (const component of components) {
      const index =
        typeof component === 'string'
          ? this.getTagIndex(component)
          : this.getComponentIndex(component);
      indices.push(index);
    }
    return new FastBitSet(indices);
  }

  /**
   * Query entities
   *
   * @param components - array of components ctors or tags
   * @returns array of entities filtered by mask
   */
  public queryEntities(
    components: (Constructor<unknown> | string)[]
  ): Array<number> {
    const mask = this.getMask(components);
    const isEqual = (entityId: number) =>
      mask.difference_size(this.masks[entityId]) === 0;
    return this.entities.filter(isEqual);
  }

  /**
   * Create query
   *
   * @param components - array of components ctors or tags
   * @returns Query object
   */
  public createQuery(
    components: (Constructor<unknown> | string)[],
    removeOnEmpty = false
  ): Query {
    const mask = this.getMask(components);
    let query = this.queries.find((q) => q.mask.equals(mask));
    if (!query) {
      query = new Query(this, mask, removeOnEmpty);
      this.queries.push(query);
      for (const entityId of this.entities.values()) {
        if (query.mask.difference_size(this.masks[entityId]) === 0) {
          query.add(entityId);
        }
      }
    }
    query.usageCounter += 1;
    return query;
  }

  /**
   * Remove query
   *
   * @param query - query object to remove
   */
  public removeQuery(query: Query): void {
    const index = this.queries.findIndex((q) => q === query);
    if (index !== -1) {
      if (query.usageCounter > 1) {
        query.usageCounter -= 1;
      } else {
        this.queries.splice(index, 1);
      }
    }
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
    const name = entityName ? entityName : entityId.toString();
    this.lookupTable[entityId] = this.entities.length;
    this.masks[entityId] = new FastBitSet(RESERVED_MASK_INDICES);
    this.components[entityId] = [];
    this.components[entityId][RESERVED_TAGS.ALIVE_INDEX] = RESERVED_TAGS.ALIVE;
    this.components[entityId][RESERVED_TAGS.NAME_INDEX] = name;
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
   * Remove entity from world and from all queries
   *
   * @param entityId - entityId
   * @throws Will throw an error if entity does not exist
   */
  public removeEntity(entityId: number): void {
    if (this.lookupTable[entityId] === -1) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    this.masks[entityId].remove(RESERVED_TAGS.ALIVE_INDEX);
    for (const query of this.queries) {
      if (query.entities.has(entityId)) {
        query.remove(entityId);
        if (query.removeOnEmpty && !query.entities.size) {
          this.removeQuery(query);
        }
      }
    }
    const name = this.components[entityId][RESERVED_TAGS.NAME_INDEX] as string;
    this.names.delete(name);
    this.components[entityId] = [];
    this.masks[entityId].clear();
    const index = this.lookupTable[entityId];
    const last = this.entities.pop();
    if (last && index < this.entities.length) {
      this.entities[index] = last;
      this.lookupTable[last] = index;
    }
    this.lookupTable[entityId] = -1;
    this.pool.push(entityId);
  }

  /**
   * Add component object to entity and update queries
   *
   * @param entityId - entity id
   * @param component - component class instance
   * @returns - component instance
   */
  public addComponent<T extends unknown>(
    entityId: number,
    component: NonNullable<T>
  ): T {
    const ctor = Object.getPrototypeOf(component).constructor;
    const componentIndex = this.getComponentIndex(ctor);
    if (this.components[entityId][componentIndex]) {
      this.removeComponent(entityId, ctor);
    }
    this.components[entityId][componentIndex] = component;
    this.addToMask(entityId, componentIndex);
    return component;
  }

  /**
   * Remove component object from entity and update queries
   *
   * @param entityId - entity id
   * @param ctor - component class constructor
   */
  public removeComponent<T>(entityId: number, ctor: Constructor<T>): void {
    const componentIndex = this.getComponentIndex(ctor);
    this.removeFromMask(entityId, componentIndex);
  }

  /**
   * Is entity has specific component
   *
   * @param entityId - entity id
   * @param ctor - class constructor
   * @returns true if component exist,or false if not
   */
  public hasComponent<T>(entityId: number, ctor: Constructor<T>): boolean {
    const componentIndex = this.getComponentIndex(ctor);
    return !!this.components[entityId][componentIndex];
  }

  /**
   * Get component object by entity id
   *
   * @param entityId - entity id
   * @param ctor - component class constructor
   * @returns component class instance
   */
  public getComponent<T>(entityId: number, ctor: Constructor<T>): T {
    const componentIndex = this.getComponentIndex(ctor);
    return this.components[entityId][componentIndex] as T;
  }

  /**
   * Add system class instance to world
   *
   * @param system - system class instance
   */
  public addSystem(system: System): void {
    this.systems.push(system);
  }

  /**
   * Remove system from world
   *
   * @param ctor - system class constructor
   */
  public removeSystem(ctor: Constructor<System>): void {
    for (const [index, system] of this.systems.entries()) {
      if (system.constructor.name === ctor.name) {
        if (system.exit) system.exit();
        this.systems.splice(index, 1);
        return;
      }
    }
  }

  /**
   * Remove all systems from world
   */
  public removeAllSystems(): void {
    this.systems.forEach((system) => {
      if (system.exit) system.exit();
    });
    this.systems.length = 0;
  }

  /**
   * destroy whole world:
   * - remove all entities
   * - call exit for all systems
   * - remove systems
   */
  public destroy(): void {
    this.clear();
    this.queries.length = 0;
    this.removeAllSystems();
  }

  /**
   * Iterate through added systems and call method on each system
   *
   * see {@link System}
   *
   * @param dt - delta time
   */
  public update(dt: number): void {
    for (const system of this.systems) {
      if (system.update) system.update(dt);
    }
  }
}
