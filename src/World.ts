import FastBitSet from 'fastbitset';
import { EventsEmitter } from './EventsEmitter';
import { Constructor } from './Helpers';
import { Query } from './Query';
import { System } from './System';
export class World {
	nextId = 0;
	pool: number[] = [];
	entities: number[] = [];
	components: Array<Array<unknown>> = [];
	masks: FastBitSet[] = [];
	queries: Query[] = [];
	lookupTable: Int32Array = new Int32Array(this.entitiesMax).fill(-1);
	registeredComponents: { [componentName: string]: number } = {};
	systems: System[] = [];
	events: EventsEmitter = new EventsEmitter();

	constructor(public entitiesMax: number) {}

	/**
	 * Add value to mask and update queries
	 *
	 * @param entityId - entity id
	 * @param index - bit index
	 */
	private addToMask(entityId: number, index: number): void {
		const mask = this.masks[entityId];
		mask.add(index);
		for (const query of this.queries) {
			if (!query.entities.has(entityId)) {
				const diff = query.mask.difference_size(mask);
				if (diff === 0) {
					query.add(entityId);
				}
			}
		}
	}

	/**
	 * Remove value from mask and update queries
	 *
	 * @param entityId - entity id
	 * @param index - bit index
	 */
	private removeFromMask(entityId: number, index: number): void {
		this.masks[entityId].remove(index);
		for (const query of this.queries) {
			if (query.entities.has(entityId)) {
				const diff = query.mask.difference_size(this.masks[entityId]);
				if (diff !== 0) {
					query.remove(entityId);
				}
			}
		}
		this.components[entityId][index] = undefined;
	}

	/**
	 * Add tag to entity
	 *
	 * @param entityId - entity id
	 * @param tag - tag name
	 */
	public addTag(entityId: number, tag: string): void {
		const tagIndex = this.getTagIndex(tag);
		if (this.components[entityId][tagIndex]) {
			this.removeTag(entityId, tag);
		}
		this.components[entityId][tagIndex] = tag;
		this.addToMask(entityId, tagIndex);
	}

	/**
	 * Is entity has specific tag
	 *
	 * @param entityId - entity id
	 * @param tag - tag name
	 */
	hasTag(entityId: number, tag: string): boolean {
		const tagIndex = this.getTagIndex(tag);
		return !!this.components[entityId][tagIndex];
	}

	/**
	 * Remove tag from entity
	 *
	 * @param entityId - entity id
	 * @param tag - tag name
	 */
	removeTag(entityId: number, tag: string): void {
		const tagIndex = this.getTagIndex(tag);
		this.removeFromMask(entityId, tagIndex);
	}

	/**
	 * Register tags
	 *
	 * @param tags - array of tags
	 */
	registerTags(tags: string[]): void {
		let index = Object.keys(this.registeredComponents).length;
		tags.forEach((tag) => {
			if (!this.registeredComponents[tag]) {
				this.registeredComponents[tag] = index;
				index += 1;
			}
		});
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
	 * Get registered tag index
	 *
	 * @param tag - tag name
	 * @returns registered tag index
	 * @throws Will throw an error if tag not registered
	 *
	 */
	getTagIndex(tag: string): number {
		const index = this.registeredComponents[tag];
		if (index === undefined) {
			throw new Error(`Tag ${tag} is not registered`);
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
	 * @returns Query object
	 */
	createQuery(components: (Constructor<unknown> | string)[]): Query {
		const indices = [];
		for (const component of components) {
			const index =
				typeof component === 'string'
					? this.getTagIndex(component)
					: this.getComponentIndex(component);
			indices.push(index);
		}
		const mask = new FastBitSet(indices);
		let query = this.queries.find((q) => q.mask.equals(mask));
		if (!query) {
			query = new Query(this, mask);
			this.queries.push(query);
			for (const entityId of this.entities.values()) {
				if (query.mask.difference_size(this.masks[entityId]) === 0) {
					query.add(entityId);
				}
			}
		}
		query.usageCounter += 1;
		return query;
	}

	/**
	 * Remove query
	 *
	 * @param query - query object to remove
	 */
	removeQuery(query: Query): void {
		const index = this.queries.findIndex((q) => q === query);
		if (index !== -1) {
			if (query.usageCounter > 1) {
				query.usageCounter -= 1;
			} else {
				this.queries.splice(index, 1);
			}
		}
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
	 * Remove entity from world and from all queries
	 *
	 * @param entityId - entityId
	 * @throws Will throw an error if entity does not exist
	 */
	removeEntity(entityId: number): void {
		if (this.lookupTable[entityId] === -1) {
			throw new Error(`Entity ${entityId} does not exist`);
		}

		for (const query of this.queries) {
			if (query.entities.has(entityId)) {
				query.remove(entityId);
			}
		}

		const index = this.lookupTable[entityId];
		const last = this.entities.pop();
		if (last && index < this.entities.length) {
			this.entities[index] = last;
			this.lookupTable[last] = index;
		}
		this.lookupTable[entityId] = -1;
		this.pool.push(entityId);
	}

	/**
	 * Add component object to entity and update queries
	 *
	 * @param entityId - entity id
	 * @param component - component class instance
	 * @returns - component instance
	 */
	public addComponent<T extends unknown>(entityId: number, component: NonNullable<T>): T {
		const ctor = Object.getPrototypeOf(component).constructor;
		const componentIndex = this.getComponentIndex(ctor);
		if (this.components[entityId][componentIndex]) {
			this.removeComponent(entityId, ctor);
		}
		this.components[entityId][componentIndex] = component;
		this.addToMask(entityId, componentIndex);
		return component;
	}

	/**
	 * Remove component object from entity and update queries
	 *
	 * @param entityId - entity id
	 * @param ctor - component class constructor
	 */
	removeComponent<T>(entityId: number, ctor: Constructor<T>): void {
		const componentIndex = this.getComponentIndex(ctor);
		this.removeFromMask(entityId, componentIndex);
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
