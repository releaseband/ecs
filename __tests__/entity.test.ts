import { World, RESERVED_TAGS, RESERVED_MASK_INDICES } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {
	value: number;
	constructor(value = 0) {
		this.value = value;
	}
}

class TestComponent1 {
	value: number;
	constructor(value = 0) {
		this.value = value;
	}
}

class TestComponent2 {
	value: number;
	constructor(value = 0) {
		this.value = value;
	}
}

describe('Entities tests', () => {
	it('Create and remove entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entity = world.createEntity();
		const name = entity.toString();
		expect(entity).toEqual(0);
		//lookup for fast access
		expect(world.lookupTable[entity]).toEqual(0);
		//init bitset
		expect(world.masks[entity]).toBeDefined();
		//set bits for reserved tags
		expect(world.masks[entity].size()).toEqual(RESERVED_MASK_INDICES.length);
		expect(world.masks[entity].has(RESERVED_TAGS.ALIVE_INDEX)).toBeTruthy();
		expect(world.masks[entity].has(RESERVED_TAGS.NAME_INDEX)).toBeTruthy();
		//set reserved tags values
		expect(world.components[entity]).toBeDefined();
		expect(world.components[entity].length).toEqual(RESERVED_MASK_INDICES.length);
		//set default unique name(entityId as string)
		expect(world.names.has(name)).toBeTruthy();
		//is name exist
		expect(world.getEntity(name)).toEqual(entity);

		world.removeEntity(entity);
		//remove from entities list
		expect(world.entities[entity]).toBeUndefined();
		//remove from lookup table name=>id
		expect(world.names.has(name)).toBeFalsy();
		expect(world.getEntity(name)).toBeUndefined();
		//clear bitset on remove
		expect(world.masks[entity].has(RESERVED_TAGS.ALIVE_INDEX)).toBeFalsy();
		expect(world.masks[entity].has(RESERVED_TAGS.NAME_INDEX)).toBeFalsy();
		//empty components
		expect(world.components[entity].length).toEqual(0);
	});
	it('Create and remove named entity', () => {
		const world = new World(ENTITIES_COUNT);
		const name = 'TEST_NAME';
		const entity = world.createEntity('TEST_NAME');
		expect(entity).toEqual(0);
		expect(world.lookupTable[entity]).toEqual(0);
		expect(world.masks[entity]).toBeDefined();
		expect(world.masks[entity].size()).toEqual(RESERVED_MASK_INDICES.length);
		expect(world.components[entity]).toBeDefined();
		expect(world.components[entity].length).toEqual(RESERVED_MASK_INDICES.length);
		expect(world.masks[entity].has(RESERVED_TAGS.ALIVE_INDEX)).toBeTruthy();
		expect(world.masks[entity].has(RESERVED_TAGS.NAME_INDEX)).toBeTruthy();
		expect(world.names.has(name)).toBeTruthy();
		expect(world.getEntity(name)).toEqual(entity);

		world.removeEntity(entity);
		expect(world.entities[entity]).toBeUndefined();
		expect(world.names.has(name)).toBeFalsy();
		expect(world.masks[entity].has(RESERVED_TAGS.ALIVE_INDEX)).toBeFalsy();
		expect(world.masks[entity].has(RESERVED_TAGS.NAME_INDEX)).toBeFalsy();
		expect(world.components[entity].length).toEqual(0);
		expect(world.getEntity(name)).toBeUndefined();
	});
	it('Create entity must throw error if entity with this name exist', () => {
		const world = new World(ENTITIES_COUNT);
		const name = 'TEST_NAME';
		world.createEntity('TEST_NAME');
		expect(() => world.createEntity('TEST_NAME')).toThrowError(
			`Entity with name ${name} already exist`
		);
	});
	it('Create multiple entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entities = [];
		const count = 5;

		for (let i = 0; i < count; i++) {
			const entity = world.createEntity();
			expect(entity).toEqual(i);
			expect(world.masks[entity].size()).toEqual(RESERVED_MASK_INDICES.length);
			expect(world.lookupTable[i]).not.toEqual(-1);
			entities.push(entity);
		}

		for (let i = entities.length - 1; i >= 0; i--) {
			world.removeEntity(entities[i]);
			expect(world.pool).toContain(entities[i]);
			expect(world.lookupTable[i]).toEqual(-1);
		}

		expect(world.pool).toEqual(expect.arrayContaining(entities));
	});
	it('Create and Remove entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entity0 = world.createEntity();
		world.removeEntity(entity0);
		expect(world.pool).toEqual([0]);
		const entity1 = world.createEntity();
		expect(entity1).toEqual(0);
		expect(world.pool.length).toEqual(0);
	});
	it('throw error on remove(entity not exist)', () => {
		const world = new World(ENTITIES_COUNT);
		const entityId = 555;
		expect(() => world.removeEntity(entityId)).toThrow(`Entity ${entityId} does not exist`);
	});
	it('Add component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();

		const component = new TestComponent0();
		const componentIndex = world.getComponentIndex(TestComponent0);
		world.addComponent(entity, component);
		expect(world.components[entity].length).toEqual(RESERVED_MASK_INDICES.length + 1);
		expect(world.components[entity][componentIndex]).toEqual(component);
		expect(world.masks[entity].has(componentIndex)).toEqual(true);
	});
	it('Add multiple components', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);
		const components = [TestComponent0, TestComponent1, TestComponent2];
		const entity = world.createEntity();

		components.forEach((ctor) => {
			const component = new ctor();
			const componentIndex = world.getComponentIndex(ctor);
			world.addComponent(entity, component);
			expect(world.components[entity][componentIndex]).toEqual(component);
			expect(world.masks[entity].has(componentIndex)).toEqual(true);
		});
	});
	it('Add and remove single component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();
		const component0 = new TestComponent0();
		const componentIndex = world.getComponentIndex(TestComponent0);
		world.addComponent(entity, component0);
		expect(world.components[entity][componentIndex]).toEqual(component0);
		expect(world.masks[entity].has(componentIndex)).toEqual(true);
		world.removeComponent(entity, TestComponent0);
		expect(world.components[entity][componentIndex]).toBeUndefined();
		expect(world.masks[entity].has(componentIndex)).toEqual(false);
	});
	it('Add and remove multiple', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);
		const components = [TestComponent0, TestComponent1, TestComponent2];
		const entity = world.createEntity();

		components.forEach((ctor) => {
			const component = new ctor();
			const componentIndex = world.getComponentIndex(ctor);
			world.addComponent(entity, component);
			expect(world.components[entity][componentIndex]).toEqual(component);
			expect(world.masks[entity].has(componentIndex)).toEqual(true);
		});

		components.forEach((ctor) => {
			const componentIndex = world.getComponentIndex(ctor);
			world.removeComponent(entity, ctor);
			expect(world.components[entity][componentIndex]).toBeUndefined();
			expect(world.masks[entity].has(componentIndex)).toEqual(false);
		});
		expect(world.masks[entity].size()).toEqual(RESERVED_MASK_INDICES.length);
	});
	it('Get component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();
		world.addComponent(entity, new TestComponent0(555));

		const component0 = world.getComponent(entity, TestComponent0);
		expect(component0).toBeDefined();
		expect(component0.value).toEqual(555);
		component0.value = 777;
		const component1 = world.getComponent(entity, TestComponent0);
		expect(component1).toBeDefined();
		expect(component1.value).toEqual(777);
	});
	it('Shared component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const component = new TestComponent0(555);
		const componentIndex = world.getComponentIndex(TestComponent0);

		const entities = [];
		for (let i = 0; i < 5; i++) {
			entities[i] = world.createEntity();
			world.addComponent(entities[i], component);
			expect(world.components[entities[i]][componentIndex]).toEqual(component);
		}
		component.value = 777;
		for (const entity of entities) {
			const data = world.getComponent(entity, TestComponent0);
			expect(data.value).toEqual(777);
		}
	});
	it('Multiple add/get', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);
		const components = [TestComponent0, TestComponent1, TestComponent2];
		const entity = world.createEntity();

		components.forEach((ctor, i) => {
			world.addComponent(entity, new ctor(i));
		});

		components.forEach((ctor, i) => {
			const component = world.getComponent(entity, ctor);
			expect(component.value).toEqual(i);
		});
	});
	it('Get component before/after add', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();

		const shouldBeUndefined = world.getComponent(entity, TestComponent0);
		expect(shouldBeUndefined).toBeUndefined();
		world.addComponent(entity, new TestComponent0());
		const shouldBeDefined = world.getComponent(entity, TestComponent0);
		expect(shouldBeDefined).toBeDefined();
		world.removeComponent(entity, TestComponent0);
		const shouldBeUndefinedAgain = world.getComponent(entity, TestComponent0);
		expect(shouldBeUndefinedAgain).toBeUndefined();
	});
	it('Check for entity component exist or not', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();
		expect(world.hasComponent(entity, TestComponent0)).toEqual(false);
		world.addComponent(entity, new TestComponent0());
		expect(world.hasComponent(entity, TestComponent0)).toEqual(true);
	});
	it('Must throw error if used non-registered component', () => {
		const world = new World(ENTITIES_COUNT);

		const component = new TestComponent1();
		const entity = world.createEntity();
		expect(() => world.addComponent(entity, component)).toThrow(
			`Component ${component.constructor.name} is not registered`
		);
	});
	it('Add component must return component instance', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent1);
		const entity = world.createEntity();
		const component = world.addComponent(entity, new TestComponent1(12345));
		expect(component).toBeDefined();
		expect(world.getComponent(entity, TestComponent1)).toEqual(component);
	});
});
