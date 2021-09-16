import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {}
class TestComponent1 {}

describe('World tests', () => {
	it('World init', () => {
		const world = new World(ENTITIES_COUNT);
		expect(world.entitiesMax).toEqual(ENTITIES_COUNT);
		expect(world.lookupTable.length).toEqual(ENTITIES_COUNT);
		expect(world.components).toBeDefined();
		expect(world.masks).toBeDefined();
		expect(world.registeredComponents).toBeDefined();
		expect(Object.keys(world.registeredComponents).length).toEqual(
			world.RESERVED_MASK_INDICES_COUNT
		);
	});
	it('Register components', () => {
		const world = new World(ENTITIES_COUNT);
		const RESERVED_INDICES = world.RESERVED_MASK_INDICES_COUNT;
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		expect(Object.keys(world.registeredComponents).length).toEqual(RESERVED_INDICES + 2);
		expect(world.getComponentIndex(TestComponent0)).toEqual(RESERVED_INDICES + 0);
		expect(world.getComponentIndex(TestComponent1)).toEqual(RESERVED_INDICES + 1);
	});
	it('Must throw error for non-registered component', () => {
		const world = new World(ENTITIES_COUNT);

		expect(() => world.getComponentIndex(TestComponent0)).toThrow(
			`Component ${TestComponent0.name} is not registered`
		);
	});
});
