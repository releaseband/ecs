import FastBitSet from 'fastbitset';
import { Constructor } from './Helpers';
import { Query } from './Query';
import { System } from './System';

export class World {
	nextId = 0;
	entitiesMax: number;
	pool: number[];
	entities: number[];
	components: Array<Array<unknown>>;
	masks: FastBitSet[];
	queries: Query[];
	lookupTable: Int32Array;
	registeredComponents: Map<string, number>;
	systems: System[];

	constructor(entitiesMax: number) {
		this.entitiesMax = entitiesMax;
		this.pool = [];
		this.lookupTable = new Int32Array(entitiesMax).fill(-1);
		this.entities = [];
		this.components = new Array(entitiesMax).fill([]);
		this.masks = new Array(entitiesMax).fill(new FastBitSet());
		this.queries = [];
		this.registeredComponents = new Map();
		this.systems = [];
	}

	/**
	 * Register component class
	 *
	 * @param {Class<T>} component
	 */
	registerComponent<T>(ctor: Constructor<T>): void {
		if (!this.registeredComponents.has(ctor.name)) {
			const n = this.registeredComponents.size;
			ctor.index = n;
			this.registeredComponents.set(ctor.name, n);
		}
	}

	/**
	 * Get next free entity id
	 *
	 * @returns {number} id number
	 */
	private getNextId(): number {
		const index = this.pool.pop();
		return index ?? this.nextId++;
	}

	/**
	 * Create query
	 *
	 * @param {Constructor<T>[]} components Array of components classes
	 * @returns {Query} Query object
	 */
	createQuery<T>(components: Constructor<T>[] = []): Query {
		const indices = [];
		for (const component of components) {
			indices.push(component.index);
		}
		const mask = new FastBitSet(indices);
		for (const query of this.queries.values()) {
			if (query.mask.equals(mask)) return query;
		}
		const query = new Query(this, mask);
		this.queries.push(query);
		for (const entityId of this.entities.values()) {
			if (query.mask.difference_size(this.masks[entityId]) === 0) query.add(entityId);
		}
		return query;
	}

	/**
	 * Create entity
	 *
	 * @returns {number} Entity id
	 */
	createEntity() {
		const entityId = this.getNextId();
		this.lookupTable[entityId] = this.entities.length;
		this.masks[entityId].clear();
		this.entities.push(entityId);
		return entityId;
	}

	/**
	 * Remove entity from world
	 *
	 * @param {number} entityId
	 */
	removeEntity(entityId: number): void {
		if (this.lookupTable[entityId] === -1) throw new Error('Entity does not exist');
		const index = this.lookupTable[entityId];
		const last = this.entities.pop();
		if (last && index < this.entities.length) {
			this.entities[index] = last;
			this.lookupTable[last] = index;
		}
		this.lookupTable[entityId] = -1;
		this.pool.push(entityId);
		for (const query of this.queries) {
			query.remove(entityId);
		}
	}

	/**
	 *
	 * @param {number} entityId
	 * @param {T} component class instance
	 */
	addComponent<T>(entityId: number, component: T): void {
		const componentIndex = Object.getPrototypeOf(component).constructor.index;
		this.components[entityId][componentIndex] = component;
		this.masks[entityId].add(componentIndex);
		for (const query of this.queries) {
			const diff = query.mask.difference_size(this.masks[entityId]);
			if (diff === 0) query.add(entityId);
		}
	}

	/**
	 *
	 * @param {number} entityId
	 * @param {Constructor<T>} ctor component class Constructor
	 */
	removeComponent<T>(entityId: number, ctor: Constructor<T>): void {
		const componentIndex = ctor.index;
		this.masks[entityId].remove(componentIndex);
		this.components[entityId][componentIndex] = undefined;
		for (const query of this.queries) {
			const diff = query.mask.difference_size(this.masks[entityId]);
			if (diff !== 0) query.remove(entityId);
		}
	}

	/**
	 *
	 * @param {number} entityId
	 * @param {Constructor} ctor component class Constructor
	 * @returns {T} component class instance
	 */

	getComponent<T>(entityId: number, ctor: Constructor<T>): T {
		const componentIndex = ctor.index;
		return <T>this.components[entityId][componentIndex];
	}

	/**
	 * Add system object to world
	 *
	 * @param {System} system System class instance
	 */
	addSystem(system: System): void {
		this.systems.push(system);
	}

	/**
	 * Remove system from world
	 *
	 * @param {Constructor<System>} ctor system constructor
	 */
	removeSystem(ctor: Constructor<System>): void {
		for (const [index, system] of this.systems.entries()) {
			if (system.constructor.name === ctor.name) {
				this.systems.splice(index, 1);
				return;
			}
		}
	}

	/**
	 * Call update method on each added system
	 *
	 * @param {number} dt delta time
	 */
	update(dt: number) {
		for (const system of this.systems) {
			system.update(dt);
		}
	}
}
