import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {}
class TestComponent1 {}

describe('World tests', () => {
	it('World init', () => {
		const world = new World(ENTITIES_COUNT);
		expect(world.entitiesMax).toEqual(ENTITIES_COUNT);
		expect(world.components.length).toEqual(ENTITIES_COUNT);
		expect(world.masks.length).toEqual(ENTITIES_COUNT);
	});
	it('Register components', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		expect(world.registeredComponents.size).toEqual(2);
		expect(world.registeredComponents.has('TestComponent0')).toEqual(true);
		expect(world.registeredComponents.has('TestComponent1')).toEqual(true);
		expect(TestComponent0.index).toEqual(0);
		expect(TestComponent1.index).toEqual(1);
	});
});
