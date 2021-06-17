import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {}
class TestComponent1 {}
class TestComponent2 {}

describe('Entities tests', () => {
	it('Create entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entity = world.createEntity();
		expect(entity).toEqual(0);
		expect(world.lookupTable[0]).toEqual(0);
	});
	it('Create multiple entity', () => {
		const world = new World(ENTITIES_COUNT);
		const entity0 = world.createEntity();
		const entity1 = world.createEntity();
		const entity2 = world.createEntity();
		expect(entity0).toEqual(0);
		expect(entity1).toEqual(1);
		expect(entity2).toEqual(2);
		world.removeEntity(entity0);
		world.removeEntity(entity1);
		world.removeEntity(entity2);
		expect(world.pool).toEqual([0, 1, 2]);
		expect(world.lookupTable[0]).toEqual(-1);
		expect(world.lookupTable[1]).toEqual(-1);
		expect(world.lookupTable[2]).toEqual(-1);
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
	it('Add component', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		const entity = world.createEntity();

		expect(world.components[entity].length).toEqual(0);
		const component = new TestComponent0();
		world.addComponent(entity, component);
		expect(world.components[entity].length).toEqual(1);
		expect(world.components[entity][0]).toEqual(component);
	});
	it('Add multiple components', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);
		const entity = world.createEntity();

		const component0 = new TestComponent0();
		const component1 = new TestComponent1();
		const component2 = new TestComponent2();
		world.addComponent(entity, component0);
		world.addComponent(entity, component1);
		world.addComponent(entity, component2);
		expect(world.components[entity].length).toEqual(3);
		expect(world.components[entity][0]).toEqual(component0);
		expect(world.components[entity][1]).toEqual(component1);
		expect(world.components[entity][2]).toEqual(component2);
	});
});
