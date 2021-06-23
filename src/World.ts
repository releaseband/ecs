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
	registeredComponents: { [componentName: string]: number };
	systems: System[];

	constructor(entitiesMax: number) {
		this.entitiesMax = entitiesMax;
		this.pool = [];
		this.lookupTable = new Int32Array(entitiesMax).fill(-1);
		this.entities = [];
		this.components = [];
		this.masks = [];
		this.queries = [];
		this.registeredComponents = {};
		this.systems = [];
	}

	/**
	 *
	 * @param componentName - component constructor name
	 * @returns registered component index
	 * @throws Will throw an error if component not registered
	 *
	 */
	getComponentIndex<T>(ctor: Constructor<T>): number {
		const index = this.registeredComponents[ctor.cachedComponentId];
		if (index === undefined) {
			throw new Error(`Component ${ctor.name} is not registered`);
		}
		return index;
	}

	/**
	 * Register component class
	 *
	 * @param component - component constructor
	 */
	registerComponent<T>(ctor: Constructor<T>): void {
		if (!this.registeredComponents[ctor.name]) {
			ctor.cachedComponentId = ctor.name;
			const index = Object.keys(this.registeredComponents).length;
			this.registeredComponents[ctor.name] = index;
		}
	}

	/**
	 * Get next free entity id
	 *
	 * @returns new entity id
	 */
	private getNextId(): number {
		const index = this.pool.pop();
		return index ?? this.nextId++;
	}

	/**
	 * Create query
	 *
	 * @param components - array of components classes
	 * @param onEntityAdd - will be called when entity added to query
	 * @param onEntityRemove - will be called when entity removed from query
	 * @returns Query object
	 */
	createQuery(
		components: Constructor<unknown>[] = [],
		options?: {
			onAddCallback?: CallableFunction;
			onRemoveCallback?: CallableFunction;
		}
	): Query {
		const indices = [];
		for (const component of components) {
			indices.push(this.getComponentIndex(component));
		}
		const mask = new FastBitSet(indices);
		for (const query of this.queries.values()) {
			if (query.mask.equals(mask)) return query;
		}
		const query = new Query(this, mask);
		if (options?.onAddCallback) {
			query.onEntityAdd.subscribe(options.onAddCallback);
		}
		if (options?.onRemoveCallback) {
			query.onEntityRemove.subscribe(options.onRemoveCallback);
		}
		this.queries.push(query);
		for (const entityId of this.entities.values()) {
			if (query.mask.difference_size(this.masks[entityId]) === 0) {
				query.add(entityId);
			}
		}
		return query;
	}

	/**
	 * Create entity
	 *
	 * @returns entity id
	 */
	createEntity(): number {
		const entityId = this.getNextId();
		this.lookupTable[entityId] = this.entities.length;
		this.masks[entityId] = new FastBitSet();
		this.components[entityId] = [];
		this.entities.push(entityId);
		return entityId;
	}

	/**
	 * Remove entity from world
	 *
	 * @param entityId - entityId
	 * @throws Will throw an error if entity does not exist
	 */
	removeEntity(entityId: number): void {
		if (this.lookupTable[entityId] === -1) throw new Error(`Entity ${entityId} does not exist`);
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
	 * Add component object to entity
	 *
	 * @param entityId - entity id
	 * @param component - component class instance
	 */
	public addComponent<T extends unknown>(entityId: number, component: NonNullable<T>): void {
		const ctor = Object.getPrototypeOf(component).constructor;
		const componentIndex = this.registeredComponents[ctor.cachedComponentId];
		if (componentIndex === undefined) {
			throw new Error(`Component ${ctor.name} is not registered`);
		}
		this.components[entityId][componentIndex] = component;
		const mask = this.masks[entityId];
		mask.add(componentIndex);
		for (const query of this.queries) {
			const diff = query.mask.difference_size(mask);
			if (diff === 0) {
				query.add(entityId);
			}
		}
	}

	/**
	 * Remove component object from entity
	 *
	 * @param entityId - entity id
	 * @param ctor - component class constructor
	 */
	removeComponent<T>(entityId: number, ctor: Constructor<T>): void {
		const componentIndex = this.getComponentIndex(ctor);
		this.masks[entityId].remove(componentIndex);
		this.components[entityId][componentIndex] = undefined;
		for (const query of this.queries) {
			const diff = query.mask.difference_size(this.masks[entityId]);
			if (diff !== 0) {
				query.remove(entityId);
			}
		}
	}

	/**
	 * Is entity has specific component
	 *
	 * @param entityId - entity id
	 * @param ctor - class constructor
	 * @returns true if component exist,or false if not
	 */
	hasComponent<T>(entityId: number, ctor: Constructor<T>): boolean {
		const componentIndex = this.getComponentIndex(ctor);
		return !!this.components[entityId][componentIndex];
	}

	/**
	 * Get component object by entity id
	 *
	 * @param entityId - entity id
	 * @param ctor - component class constructor
	 * @returns component class instance
	 */
	getComponent<T>(entityId: number, ctor: Constructor<T>): T {
		const componentIndex = this.getComponentIndex(ctor);
		return this.components[entityId][componentIndex] as T;
	}

	/**
	 * Add system class instance to world
	 *
	 * @param system - system class instance
	 */
	addSystem(system: System): void {
		this.systems.push(system);
	}

	/**
	 * Remove system from world
	 *
	 * @param ctor - system class constructor
	 */
	removeSystem(ctor: Constructor<System>): void {
		for (const [index, system] of this.systems.entries()) {
			if (system.constructor.name === ctor.name) {
				if (system.exit) system.exit();
				this.systems.splice(index, 1);
				return;
			}
		}
	}

	/**
	 * Iterate through added systems and call method on each system
	 *
	 * see {@link System}
	 *
	 * @param dt - delta time
	 */
	update(dt: number): void {
		for (const system of this.systems) {
			if (system.update) system.update(dt);
		}
	}
}
