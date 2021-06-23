import { Query } from '../src/Query';
import { World } from '../src/World';

const ENTITIES_COUNT = 1_000_000;

class TestComponent0 {}
class TestComponent1 {}
class TestComponent2 {}
class TestComponent3 {}
class TestComponent4 {}

describe('Query tests', () => {
	it('Create query', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);

		const query = world.createQuery([TestComponent0]);
		const componentIndex = world.getComponentIndex(TestComponent0);
		expect(query).toBeDefined();
		expect(world.queries.length).toEqual(1);
		expect(world.queries).toContain(query);
		expect(query.mask).toBeDefined();
		expect(query.mask.has(componentIndex)).toBe(true);
		expect(query.entities).toBeDefined();
	});
	it('Create query in any order', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);

		const entity = world.createEntity();
		world.addComponent(entity, new TestComponent0());

		const query = world.createQuery([TestComponent0]);

		expect(query.entities.size).toEqual(1);
	});
	it('Create multiple query', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);

		const QUERIES = [
			[TestComponent0],
			[TestComponent1],
			[TestComponent2],
			[TestComponent0, TestComponent1, TestComponent2],
		];

		const createdQueries: Query[] = [];

		QUERIES.forEach((ctors) => {
			const query = world.createQuery(ctors);
			expect(query).toBeDefined();
			expect(world.queries).toContain(query);
			expect(query.mask).toBeDefined();
			ctors.forEach((ctor) => {
				const componentIndex = world.getComponentIndex(ctor);
				expect(query.mask.has(componentIndex)).toBe(true);
			});
			createdQueries.push(query);
		});
		expect(world.queries.length).toEqual(4);
		expect(world.queries).toEqual(expect.arrayContaining(createdQueries));
	});
	it('Is query updated', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);

		const query = world.createQuery([TestComponent0]);

		expect(query.entities.size).toEqual(0);
		const entity0 = world.createEntity();
		expect(query.entities.size).toEqual(0);
		world.addComponent(entity0, new TestComponent0());
		expect(query.entities.size).toEqual(1);
		expect(query.entities.has(entity0)).toEqual(true);
		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent1());
		expect(query.entities.size).toEqual(1);
	});
	it('Is query updated for multiple components', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);

		const query = world.createQuery([TestComponent0, TestComponent1, TestComponent2]);
		expect(query.mask.has(world.getComponentIndex(TestComponent0))).toEqual(true);
		expect(query.mask.has(world.getComponentIndex(TestComponent1))).toEqual(true);
		expect(query.mask.has(world.getComponentIndex(TestComponent2))).toEqual(true);

		const entity = world.createEntity();
		world.addComponent(entity, new TestComponent0());
		world.addComponent(entity, new TestComponent1());
		expect(query.entities.size).toEqual(0);

		world.addComponent(entity, new TestComponent2());
		expect(query.entities.size).toEqual(1);
		expect(query.entities.has(entity)).toEqual(true);
		expect(world.masks[entity].union_size(query.mask)).toEqual(world.masks[entity].size());

		world.removeComponent(entity, TestComponent2);
		expect(query.entities.size).toEqual(0);
		expect(query.entities.has(entity)).toEqual(false);
	});
	it('Is query updated for different components combo', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);
		world.registerComponent(TestComponent3);
		world.registerComponent(TestComponent4);

		const query = world.createQuery([TestComponent0, TestComponent2]);

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent0());
		world.addComponent(entity0, new TestComponent1());

		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent0());
		world.addComponent(entity1, new TestComponent1());
		world.addComponent(entity1, new TestComponent2());
		world.addComponent(entity1, new TestComponent3());

		const entity2 = world.createEntity();
		world.addComponent(entity2, new TestComponent2());
		world.addComponent(entity2, new TestComponent0());

		const entity3 = world.createEntity();
		world.addComponent(entity3, new TestComponent4());

		const entity4 = world.createEntity();
		world.addComponent(entity4, new TestComponent3());
		world.addComponent(entity4, new TestComponent2());
		world.addComponent(entity4, new TestComponent0());

		expect(query.entities.size).toEqual(3);
		expect(query.entities.has(entity1)).toEqual(true);
		expect(query.entities.has(entity2)).toEqual(true);
		expect(query.entities.has(entity4)).toEqual(true);
	});
	it('Is query cached', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);

		const query0 = world.createQuery([TestComponent0, TestComponent1]);
		const query1 = world.createQuery([TestComponent1, TestComponent0]);
		expect(world.queries.length).toEqual(1);
		expect(query0).toEqual(query1);
	});
	it('OnEntityAdd event trigger check', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);

		let testValue = 0;

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent0());
		world.addComponent(entity0, new TestComponent1());
		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent0());

		const testCallBack = () => testValue++;

		const query = world.createQuery([TestComponent0, TestComponent1]);
		query.onAddSubscribe(testCallBack);

		expect(testValue).toEqual(1);
		world.addComponent(entity1, new TestComponent1());
		expect(testValue).toEqual(2);

		query.onAddUnsubscribe(testCallBack);

		const entity2 = world.createEntity();
		world.addComponent(entity2, new TestComponent0());
		world.addComponent(entity2, new TestComponent1());

		expect(testValue).toEqual(2);
	});
	it('OnEntityRemove event trigger', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);

		let testValue = 0;

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent0());
		world.addComponent(entity0, new TestComponent1());
		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent0());
		world.addComponent(entity1, new TestComponent1());
		const entity2 = world.createEntity();
		world.addComponent(entity2, new TestComponent0());
		world.addComponent(entity2, new TestComponent1());

		const testCallBack = () => testValue++;

		const query = world.createQuery([TestComponent0, TestComponent1]);
		query.onRemoveSubscribe(testCallBack);

		world.removeComponent(entity1, TestComponent1);
		expect(testValue).toEqual(1);
		world.removeEntity(entity0);
		expect(testValue).toEqual(2);

		query.onRemoveUnsubscribe(testCallBack);

		world.removeEntity(entity2);
		expect(testValue).toEqual(2);
	});
	it('Trigger onEntityAdd on subscribe,previous subscribers must not called', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);

		let query0Value = 0;
		let query1Value = 0;

		const query0dCallback = () => query0Value++;
		const query1dCallback = () => query1Value++;

		const query0 = world.createQuery([TestComponent0]);
		query0.onAddSubscribe(query0dCallback);

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent0());
		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent0());

		const query1 = world.createQuery([TestComponent0]);
		query1.onAddSubscribe(query1dCallback);

		expect(query0Value).toEqual(2);
		expect(query1Value).toEqual(2);
	});
	it('onEntityAdd must not trigger if entity already in query', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);

		let queryValue = 0;

		const queryCallback = () => queryValue++;

		const query = world.createQuery([TestComponent0]);
		query.onAddSubscribe(queryCallback);

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent0());
		expect(queryValue).toEqual(1);
		world.addComponent(entity0, new TestComponent1());
		expect(queryValue).toEqual(1);
	});
	it('Must not trigger onRemove if no entity in query', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerComponent(TestComponent1);
		world.registerComponent(TestComponent2);

		let queryValue = 0;

		const queryCallback = () => queryValue++;

		const entity0 = world.createEntity();
		world.addComponent(entity0, new TestComponent1());
		const entity1 = world.createEntity();
		world.addComponent(entity1, new TestComponent2());

		const query = world.createQuery([TestComponent0]);
		query.onRemoveSubscribe(queryCallback);

		world.removeEntity(entity0);
		expect(queryValue).toEqual(0);
		world.removeEntity(entity1);
		expect(queryValue).toEqual(0);
	});
});
