import FastBitSet from 'fastbitset';
import { World } from './World';
import { Emitter } from './Emitter';

export class Query {
	world: World;
	mask: FastBitSet;
	entities: Set<number>;
	private onEntityAdd: Emitter;
	private onEntityRemove: Emitter;

	constructor(world: World, mask: FastBitSet) {
		this.world = world;
		this.mask = mask;
		this.entities = new Set();
		this.onEntityAdd = new Emitter();
		this.onEntityRemove = new Emitter();
	}

	/**
	 * Subscribe for onEntityAdd event
	 *
	 * @param callback - will triggered when entity added to query
	 */
	onAddSubscribe(callback: CallableFunction): void {
		this.onEntityAdd.subscribe(callback);
		for (const entity of this.entities) {
			callback(entity);
		}
	}

	/**
	 * Subscribe for onEntityRemove event
	 *
	 * @param callback - will triggered when entity removed from query
	 */
	onRemoveSubscribe(callback: CallableFunction): void {
		this.onEntityRemove.subscribe(callback);
	}

	/**
	 * Unsubscribe for onEntityAdd event
	 *
	 * @param callback - will be removed from subscribers
	 */
	onAddUnsubscribe(callback: CallableFunction): void {
		this.onEntityAdd.unsubscribe(callback);
	}

	/**
	 * Unsubscribe for onEntityRemove event
	 *
	 * @param callback - will be removed from subscribers
	 */
	onRemoveUnsubscribe(callback: CallableFunction): void {
		this.onEntityRemove.unsubscribe(callback);
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
