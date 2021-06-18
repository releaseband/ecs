import { System } from '../src/System';
import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestSystem0 implements System {
	testValue: number | null = null;
	update(dt: number): void {
		this.testValue = dt;
	}
}

class TestSystem1 implements System {
	testValue: number | null = null;
	update(dt: number): void {
		this.testValue = dt;
	}
}

describe('System tests', () => {
	it('Add system', () => {
		const world = new World(ENTITIES_COUNT);

		const system = new TestSystem0();
		world.addSystem(system);

		expect(world.systems).toBeDefined();
		expect(world.systems.length).toEqual(1);
		expect(world.systems).toContain(system);
	});
	it('Add multiple systems', () => {
		const world = new World(ENTITIES_COUNT);

		const system0 = new TestSystem0();
		const system1 = new TestSystem1();
		world.addSystem(system0);
		world.addSystem(system1);

		expect(world.systems.length).toEqual(2);
		expect(world.systems).toEqual(expect.arrayContaining([system0, system1]));
	});
	it('Iterate through systems and call Update method', () => {
		const world = new World(ENTITIES_COUNT);
		const system0 = new TestSystem0();
		const system1 = new TestSystem1();
		world.addSystem(system0);
		world.addSystem(system1);

		world.update(1);

		expect(system0.testValue).toEqual(1);
		expect(system1.testValue).toEqual(1);
	});
	it('Remove system instance from world', () => {
		const world = new World(ENTITIES_COUNT);
		const system0 = new TestSystem0();
		const system1 = new TestSystem1();
		world.addSystem(system0);
		world.addSystem(system1);

		world.update(1);

		expect(system0.testValue).toEqual(1);
		expect(system1.testValue).toEqual(1);

		world.removeSystem(TestSystem0);
		world.removeSystem(TestSystem1);

		world.update(2);

		expect(system0.testValue).toEqual(1);
		expect(system1.testValue).toEqual(1);
		expect(world.systems.length).toEqual(0);
	});
});
