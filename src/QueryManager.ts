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
  public registry: Array<RegistryEntry> = [];

  private isNeedCleanUp = false;

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
    this.registry.push(entry);
    return entry;
  }

  /**
   * Find entry by mask
   *
   * @param queryMask - query mask
   * @returns registry entry or undefined
   */
  public getRegistryEntry(queryMask: QueryMask): RegistryEntry | undefined {
    return this.registry.find((entry) => entry.queryMask.equal(queryMask));
  }

  /**
   * Check is registry contain query
   *
   * @param query - query instance
   * @returns is query used
   */
  public hasQuery(query: Query): boolean {
    const isQueryExist = this.registry.find((entry) => entry.queries.has(query));
    return !!isQueryExist;
  }

  /**
   * Create query instance
   *
   * @param queryMask - query mask
   * @param removeOnEmpty - remove on empty flag
   * @returns new query instance
   */
  public createQuery(queryMask: QueryMask, removeOnEmpty: boolean): Query {
    const entry = this.getRegistryEntry(queryMask) || this.createEntry(queryMask);
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

  private registryPurge(): void {
    if (this.isNeedCleanUp) {
      this.registry = this.registry.filter((entry) => entry.queries.size);
      this.isNeedCleanUp = false;
    }
  }

  /**
   * Remove query from registry
   *
   * @param query - query instance
   */
  // TODO: need throw error if query not registered?
  public removeQuery(query: Query): void {
    const entry = this.registry.find((e) => e.queryMask.equal(query.queryMask));
    if (entry) {
      query.dispose();
      entry.queries.delete(query);
      this.isNeedCleanUp = true;
      this.registryPurge();
    }
  }

  /**
   * Remove multiple queries
   *
   * @param queryMask - query mask
   *
   */
  public removeQueries(queryMask: QueryMask): void {
    const entry = this.getRegistryEntry(queryMask);
    if (entry) {
      entry.queries.forEach((query) => this.removeQuery(query));
    }
  }

  public removeEntity(entityId: number): void {
    this.registry.forEach((entry) => {
      if (entry.entities.has(entityId)) {
        entry.entities.delete(entityId);
        const isEmpty = entry.entities.size === 0;
        entry.queries.forEach((query) => {
          query.remove(entityId);
          if (query.removeOnEmpty && isEmpty) {
            entry.queries.delete(query);
            this.isNeedCleanUp = true;
          }
        });
      }
    });
    this.registryPurge();
  }

  public updateEntity(entityId: number): void {
    const mask = getEntityMask(entityId, this.masks);
    this.registry.forEach((entry) => {
      const isExist = entry.entities.has(entityId);
      const isMatch = entry.queryMask.match(mask);
      if (isExist && !isMatch) {
        entry.queries.forEach((query) => {
          entry.entities.delete(entityId);
          query.remove(entityId);
          if (!entry.entities.size && query.removeOnEmpty) {
            query.dispose();
            entry.queries.delete(query);
            this.isNeedCleanUp = true;
          }
        });
      } else if (!isExist && isMatch) {
        entry.entities.add(entityId);
        entry.queries.forEach((query) => query.add(entityId));
      }
    });
    this.registryPurge();
  }

  public dispose(): void {
    this.registry.forEach((entry) => {
      entry.queries.forEach((query) => query.dispose());
      entry.queries.clear();
    });
    this.registry.length = 0;
  }
}
