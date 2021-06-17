import FastBitSet from 'fastbitset';
import { World } from './World';

export class Query {
	world: World;
	mask: FastBitSet;
	entities: Set<number>;

	constructor(world: World, mask: FastBitSet) {
		this.world = world;
		this.mask = mask;
		this.entities = new Set();
	}

	/**
	 * Add entity id to query
	 *
	 * @param {number} entityId
	 */
	add(entityId: number): void {
		this.entities.add(entityId);
	}

	/**
	 * Remove entity id from query
	 *
	 * @param {number} entityId
	 */
	remove(entityId: number): void {
		this.entities.delete(entityId);
	}
}
