/* eslint-disable no-restricted-syntax */
import FastBitSet from 'fastbitset';

import QueryEventsEmitter from './QueryEventsEmitter';

export type Predicate = (entity: number) => boolean;

export class Query {
  usageCounter = 0;

  entities = new Set<number>();

  private onEntityAdd = new QueryEventsEmitter();

  private onEntityRemove = new QueryEventsEmitter();

  private onEmpty = new QueryEventsEmitter();

  constructor(public mask: FastBitSet, public removeOnEmpty: boolean) {}

  /**
   * Subscribe for onEntityAdd event
   *
   * @param callback - will triggered when entity added to query
   * @param noEmitOnSubscribe - emit onAdd event for entities already in the queue after subscribe
   */
  onAddSubscribe(callback: CallableFunction, noEmitOnSubscribe = false): Query {
    this.onEntityAdd.subscribe(callback);
    if (!noEmitOnSubscribe) {
      for (const entity of this.entities) {
        callback(entity);
      }
    }
    return this;
  }

  /**
   * Subscribe for onEntityAdd event
   *
   * @param callback - will triggered when entity added to query and immediately removed from queue
   */
  onAddOnceSubscribe(callback: CallableFunction): Query {
    this.onEntityAdd.subscribe(callback, true);
    return this;
  }

  /**
   *
   * @param callback - will fire when the query is empty
   * @param once - when true, the listener is immediately removed when it invoked
   * @returns query
   */
  onEmptySubscribe(callback: CallableFunction): Query {
    this.onEmpty.subscribe(callback);
    return this;
  }

  /**
   * Subscribe for onEmpty event
   *
   * @param callback - will fire when the query is empty and immediately removed from queue
   * @returns query
   */
  onEmptyOnceSubscribe(callback: CallableFunction): Query {
    this.onEmpty.subscribe(callback, true);
    return this;
  }

  /**
   *
   * @param callback - callback that will be removed from subscribers
   * @returns query
   */
  onEmptyUnsubscribe(callback: CallableFunction): Query {
    this.onEmpty.unsubscribe(callback);
    return this;
  }

  /**
   * Subscribe for onEntityRemove event
   *
   * @param callback - will triggered when entity removed from query
   */
  onRemoveSubscribe(callback: CallableFunction): Query {
    this.onEntityRemove.subscribe(callback);
    return this;
  }

  /**
   * Subscribe for onEntityRemove event
   *
   * @param callback - will triggered when entity removed from query and immediately unsubscribed
   */
  onRemoveOnceSubscribe(callback: CallableFunction): Query {
    this.onEntityRemove.subscribe(callback, true);
    return this;
  }

  /**
   * Unsubscribe for onEntityAdd event
   *
   * @param callback - will be removed from subscribers
   */
  onAddUnsubscribe(callback: CallableFunction): Query {
    this.onEntityAdd.unsubscribe(callback);
    return this;
  }

  /**
   * Unsubscribe for onEntityRemove event
   *
   * @param callback - will be removed from subscribers
   */
  onRemoveUnsubscribe(callback: CallableFunction): Query {
    this.onEntityRemove.unsubscribe(callback);
    return this;
  }

  /**
   * Add entity id to query
   *
   * @param entityId - entity id
   */
  add(entityId: number): void {
    this.entities.add(entityId);
    this.onEntityAdd.emit(entityId);
  }

  /**
   * Remove entity id from query
   *
   * @param entityId - entity id
   */
  remove(entityId: number): void {
    this.entities.delete(entityId);
    this.onEntityRemove.emit(entityId);
    if (!this.entities.size) {
      this.onEmpty.emit(entityId);
    }
  }

  /**
   * Find first entity that matches predicate function
   *
   * @param predicate - function that return a true|false value based on entity condition
   * @returns entity id
   */
  find(predicate: Predicate): number | undefined {
    for (const entity of this.entities) {
      if (predicate(entity)) return entity;
    }
    return undefined;
  }

  /**
   * Filter entities that matches predicate function
   *
   * @param predicate - function that return a true|false value based on entity condition
   * @returns array of entities id
   */
  filter(predicate: Predicate): number[] {
    const filtered = [];
    for (const entity of this.entities) {
      if (predicate(entity)) {
        filtered.push(entity);
      }
    }
    return filtered;
  }
}
