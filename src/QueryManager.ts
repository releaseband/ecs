import FastBitSet from 'fastbitset';

import { getEntityMask } from './Helpers';
import { Query } from './Query';
import QueryMask from './QueryMask';

type RegistryEntry = {
  queryMask: QueryMask;
  entities: Set<number>;
  queries: Set<Query>;
};

export default class QueryManager {
  public readonly registry = new Map<string, RegistryEntry>();

  constructor(
    private readonly entities: Array<number>,
    private readonly masks: Array<FastBitSet>,
  ) {}

  /**
   * creates empty registry entry
   *
   * @param queryMask - query mask
   * @returns registry entry
   */
  private createEntry(queryMask: QueryMask): RegistryEntry {
    const entry = {
      queryMask,
      entities: new Set<number>(),
      queries: new Set<Query>(),
    };
    this.registry.set(queryMask.key, entry);
    return entry;
  }

  /**
   * remove reg entry and all queries
   *
   * @param entry - registry entry
   */
  private removeEntry(entry: RegistryEntry): void {
    entry.queries.forEach((query) => this.removeQuery(query));
    this.registry.delete(entry.queryMask.key);
  }

  /**
   *
   * remove entity from reg entry(all queries)
   *
   * @param entry - registry entry
   * @param entityId - entity id
   */
  private removeEntityFromEntry(entry: RegistryEntry, entityId: number): void {
    entry.entities.delete(entityId);
    entry.queries.forEach((query) => {
      query.remove(entityId);
      if (!entry.entities.size && query.removeOnEmpty) {
        query.dispose();
        entry.queries.delete(query);
        if (!entry.queries.size) this.registry.delete(entry.queryMask.key);
      }
    });
  }

  /**
   * Check is registry contain query
   *
   * @param query - query instance
   * @returns is query used
   */
  public hasQuery(query: Query): boolean {
    return !!this.registry.get(query.queryMask.key)?.queries.has(query);
  }

  /**
   * Create query instance
   *
   * @param queryMask - query mask
   * @param removeOnEmpty - remove on empty flag
   * @returns new query instance
   */
  public createQuery(queryMask: QueryMask, removeOnEmpty: boolean): Query {
    const entry = this.registry.get(queryMask.key) ?? this.createEntry(queryMask);
    const query = new Query(entry.entities, queryMask, removeOnEmpty);
    entry.queries.add(query);
    this.entities.forEach((entityId) => {
      const mask = getEntityMask(entityId, this.masks);
      if (queryMask.match(mask)) {
        query.add(entityId);
        entry.entities.add(entityId);
      }
    });
    return query;
  }

  /**
   * Remove query from registry
   *
   * @param query - query instance
   */
  // TODO: need throw error if query not registered?
  public removeQuery(query: Query): void {
    const { key } = query.queryMask;
    const entry = this.registry.get(key);
    if (entry) {
      query.dispose();
      entry.queries.delete(query);
      if (!entry.queries.size) this.registry.delete(key);
    }
  }

  /**
   * Remove multiple queries
   *
   * @param queryMask - query mask
   *
   */
  public removeQueries(queryMask: QueryMask): void {
    const entry = this.registry.get(queryMask.key);
    if (entry) this.removeEntry(entry);
  }

  public removeEntity(entityId: number): void {
    this.registry.forEach((entry) => {
      if (entry.entities.has(entityId)) this.removeEntityFromEntry(entry, entityId);
    });
  }

  public updateEntity(entityId: number): void {
    const mask = getEntityMask(entityId, this.masks);
    this.registry.forEach((entry) => {
      const isExist = entry.entities.has(entityId);
      const isMatch = entry.queryMask.match(mask);
      if (isExist && !isMatch) {
        this.removeEntityFromEntry(entry, entityId);
      } else if (!isExist && isMatch) {
        entry.entities.add(entityId);
        entry.queries.forEach((query) => query.add(entityId));
      }
    });
  }

  public dispose(): void {
    this.registry.forEach((entry) => this.removeEntry(entry));
    this.registry.clear();
  }
}
