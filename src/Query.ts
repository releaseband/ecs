import FastBitSet from 'fastbitset';
import { World } from './World';
import { Emitter } from './Emitter';

export class Query {
	world: World;
	mask: FastBitSet;
	entities: Set<number>;
	onEntityAdd: Emitter;
	onEntityRemove: Emitter;

	constructor(world: World, mask: FastBitSet) {
		this.world = world;
		this.mask = mask;
		this.entities = new Set();
		this.onEntityAdd = new Emitter();
		this.onEntityRemove = new Emitter();
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
