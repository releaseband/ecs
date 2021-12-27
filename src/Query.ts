import FastBitSet from 'fastbitset';

import EventsEmitter from './EventsEmitter';
import QueryMask from './QueryMask';

export type Predicate = (entity: number) => boolean;

enum Event {
  onEntityAdd = 'ON_ENTITY_ADD',
  onEntityRemove = 'ON_ENTITY_REMOVE',
  onEmpty = 'ON_EMPTY',
}

export class Query {
  usageCounter = 1;

  entities = new Set<number>();

  private events = new EventsEmitter();

  constructor(public queryMask: QueryMask, public removeOnEmpty: boolean) {}

  /**
   *
   * @param entityId - entity id
   * @param mask - entity mask
   * @returns is query empty and must be removed
   */
  update(entityId: number, mask: FastBitSet): boolean {
    const isExist = this.entities.has(entityId);
    const isMatch = this.queryMask.match(mask);
    if (isExist && !isMatch) {
      this.remove(entityId);
    } else if (!isExist && isMatch) {
      this.add(entityId);
    }
    return this.removeOnEmpty && !this.entities.size;
  }

  /**
   * Subscribe for onEntityAdd event
   *
   * @param callback - will triggered when entity added to query
   * @param noEmitOnSubscribe - emit onAdd event for entities already in the queue after subscribe
   */
  onAddSubscribe(callback: CallableFunction, noEmitOnSubscribe = false): Query {
    this.events.on(Event.onEntityAdd, callback);
    if (!noEmitOnSubscribe) {
      this.entities.forEach((entity) => callback(entity));
    }
    return this;
  }

  /**
   * Subscribe for onEntityAdd event
   *
   * @param callback - will triggered when entity added to query and immediately removed from queue
   */
  onAddOnceSubscribe(callback: CallableFunction): Query {
    this.events.on(Event.onEntityAdd, callback, true);
    return this;
  }

  /**
   *
   * @param callback - will fire when the query is empty
   * @param once - when true, the listener is immediately removed when it invoked
   * @returns query
   */
  onEmptySubscribe(callback: CallableFunction): Query {
    this.events.on(Event.onEmpty, callback);
    return this;
  }

  /**
   * Subscribe for onEmpty event
   *
   * @param callback - will fire when the query is empty and immediately removed from queue
   * @returns query
   */
  onEmptyOnceSubscribe(callback: CallableFunction): Query {
    this.events.on(Event.onEmpty, callback, true);
    return this;
  }

  /**
   *
   * @param callback - callback that will be removed from subscribers
   * @returns query
   */
  onEmptyUnsubscribe(callback: CallableFunction): Query {
    this.events.remove(Event.onEmpty, callback);
    return this;
  }

  /**
   * Subscribe for onEntityRemove event
   *
   * @param callback - will triggered when entity removed from query
   */
  onRemoveSubscribe(callback: CallableFunction): Query {
    this.events.on(Event.onEntityRemove, callback);
    return this;
  }

  /**
   * Subscribe for onEntityRemove event
   *
   * @param callback - will triggered when entity removed from query and immediately unsubscribed
   */
  onRemoveOnceSubscribe(callback: CallableFunction): Query {
    this.events.on(Event.onEntityRemove, callback, true);
    return this;
  }

  /**
   * Unsubscribe for onEntityAdd event
   *
   * @param callback - will be removed from subscribers
   */
  onAddUnsubscribe(callback: CallableFunction): Query {
    this.events.remove(Event.onEntityAdd, callback);
    return this;
  }

  /**
   * Unsubscribe for onEntityRemove event
   *
   * @param callback - will be removed from subscribers
   */
  onRemoveUnsubscribe(callback: CallableFunction): Query {
    this.events.remove(Event.onEntityRemove, callback);
    return this;
  }

  /**
   * Add entity id to query
   *
   * @param entityId - entity id
   */
  add(entityId: number): void {
    this.entities.add(entityId);
    this.events.emit(Event.onEntityAdd, entityId);
  }

  /**
   * Remove entity id from query
   *
   * @param entityId - entity id
   */
  remove(entityId: number): void {
    this.entities.delete(entityId);
    this.events.emit(Event.onEntityRemove, entityId);
    if (!this.entities.size) {
      this.events.emit(Event.onEmpty, entityId);
    }
  }

  /**
   * Find first entity that matches predicate function
   *
   * @param predicate - function that return a true|false value based on entity condition
   * @returns entity id
   */
  find(predicate: Predicate): number | undefined {
    // eslint-disable-next-line no-restricted-syntax
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
    return Array.from(this.entities).filter(predicate);
  }

  /**
   * Decrease usage counter
   * @returns is no one use this query
   */
  dispose(): boolean {
    this.usageCounter -= 1;
    return this.usageCounter === 0;
  }
}
