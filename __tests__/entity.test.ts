import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {
	value: number;
	constructor(value: number = 0) {
		this.value = value;
	}
}

class TestComponent1 {
	value: number;
	constructor(value: number = 0) {
		this.value = value;
	}
}

class TestComponent2 {
	value: number;
	constructor(value: number = 0) {
		this.value = value;
	}
}

describe('Entities tests', () => {
	it('Create entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entity = world.createEntity();
		expect(entity).toEqual(0);
		expect(world.lookupTable[0]).toEqual(0);
		expect(world.masks[entity].size()).toEqual(0);
	});
	it('Create multiple entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entities = [];
		const count = 5;

		for (let i = 0; i < count; i++) {
			const entity = world.createEntity();
			expect(entity).toEqual(i);
			expect(world.masks[entity].size()).toEqual(0);
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
		expect(() => world.removeEntity(555)).toThrow('Entity does not exist');
	});
	it('Add component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();

		expect(world.components[entity].length).toEqual(0);
		const component = new TestComponent0();
		world.addComponent(entity, component);
		expect(world.components[entity][TestComponent0.index]).toEqual(component);
		expect(world.masks[entity].has(TestComponent0.index)).toEqual(true);
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
			world.addComponent(entity, component);
			expect(world.components[entity][ctor.index]).toEqual(component);
			expect(world.masks[entity].has(ctor.index)).toEqual(true);
		});
	});
	it('Add and remove single component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();
		const component0 = new TestComponent0();
		world.addComponent(entity, component0);
		expect(world.components[entity][TestComponent0.index]).toEqual(component0);
		expect(world.masks[entity].has(TestComponent0.index)).toEqual(true);
		world.removeComponent(entity, TestComponent0);
		expect(world.components[entity][TestComponent0.index]).toBeUndefined();
		expect(world.masks[entity].has(TestComponent0.index)).toEqual(false);
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
			world.addComponent(entity, component);
			expect(world.components[entity][ctor.index]).toEqual(component);
			expect(world.masks[entity].has(ctor.index)).toEqual(true);
		});

		components.forEach((ctor) => {
			world.removeComponent(entity, ctor);
			expect(world.components[entity][ctor.index]).toBeUndefined();
			expect(world.masks[entity].has(ctor.index)).toEqual(false);
		});

		expect(world.masks[entity].size()).toEqual(0);
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

		const entities = [];
		for (let i = 0; i < 5; i++) {
			entities[i] = world.createEntity();
			world.addComponent(entities[i], component);
			expect(world.components[entities[i]][TestComponent0.index]).toEqual(component);
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
	it('get component before/after add', () => {
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
});
