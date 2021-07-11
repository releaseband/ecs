import FastBitSet from 'fastbitset';
import { World } from './World';
import { Emitter } from './Emitter';

export class Query {
	entities: Set<number>;
	private onEntityAdd: Emitter;
	private onEntityRemove: Emitter;

	constructor(private world: World, public mask: FastBitSet) {
		this.entities = new Set();
		this.onEntityAdd = new Emitter();
		this.onEntityRemove = new Emitter();
	}

	/**
	 * Subscribe for onEntityAdd event
	 *
	 * @param callback - will triggered when entity added to query
	 */
	onAddSubscribe(callback: CallableFunction): Query {
		this.onEntityAdd.subscribe(callback);
		for (const entity of this.entities) {
			callback(entity);
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
}
