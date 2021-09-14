import FastBitSet from 'fastbitset';
import { World } from './World';

interface Emitter {
	subscribe(cb: CallableFunction): void;
	unsubscribe(cb: CallableFunction): void;
	emit<T>(arg: T): void;
}

class QueryEventsEmitter {
	private subscribers: CallableFunction[] = [];

	/**
	 * Add subscriber for the event
	 *
	 * @param cb - Callback that is triggered when the event is fired
	 */
	subscribe(cb: CallableFunction): void {
		this.subscribers.push(cb);
	}

	/**
	 * Remove subscriber
	 *
	 * @param cb - Callback that you want to unsubscribe
	 */
	unsubscribe(cb: CallableFunction): void {
		this.subscribers = this.subscribers.filter((callback) => callback !== cb);
	}

	/**
	 * Fire event
	 *
	 * @param args - optional args that you want to pass to subscribers
	 */
	emit<T extends unknown[]>(...args: T): void {
		for (const subscriber of this.subscribers) {
			subscriber(...args);
		}
	}
}

export type Predicate = (entity: number) => boolean;
export class Query {
	usageCounter = 0;
	entities = new Set<number>();
	private onEntityAdd: Emitter;
	private onEntityRemove: Emitter;

	constructor(private world: World, public mask: FastBitSet) {
		this.onEntityAdd = new QueryEventsEmitter();
		this.onEntityRemove = new QueryEventsEmitter();
	}

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
	 * Subscribe for onEntityRemove event
	 *
	 * @param callback - will triggered when entity removed from query
	 */
	onRemoveSubscribe(callback: CallableFunction): Query {
		this.onEntityRemove.subscribe(callback);
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

	/**
	 * Remove all query entities from world
	 *
	 */
	clear(): void {
		for (const entity of this.entities) {
			this.world.removeEntity(entity);
		}
	}
}
