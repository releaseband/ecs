import { World } from '../src/World';

const ENTITIES_COUNT = 1_000;

const tags = ['tag0', 'tag1', 'tag2'];

class TestComponent0 {}

describe('Tags tests', () => {
	it('Register tags', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerTags(tags);
		expect(world.registeredComponents).toMatchObject({
			TestComponent0: 0,
			tag0: 1,
			tag1: 2,
			tag2: 3,
		});
	});
	it('Add,remove and has tags', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerComponent(TestComponent0);
		world.registerTags(tags);

		let value = 0;
		const query = world
			.createQuery([TestComponent0, tags[0], tags[1]])
			.onAddSubscribe(() => (value += 1));

		const entity = world.createEntity();
		world.addComponent(entity, new TestComponent0());
		world.addTag(entity, tags[0]);
		expect(value).toEqual(0);
		world.addTag(entity, tags[1]);
		// entity added, value = 1
		expect(value).toEqual(1);
		world.addTag(entity, tags[2]);
		expect(value).toEqual(1);
		// same tag added,onAdd callback invoked again, value = 2
		world.addTag(entity, tags[1]);
		expect(value).toEqual(2);

		world.removeTag(entity, tags[2]);
		expect(world.hasTag(entity, tags[2])).not.toBeTruthy();
		expect(world.hasTag(entity, tags[0])).toBeTruthy();
		expect(world.hasTag(entity, tags[1])).toBeTruthy();

		query.onRemoveSubscribe(() => (value -= 1));

		expect(value).toEqual(2);
		world.removeTag(entity, tags[1]);
		// entity removed from query,onRemove invoked, value = 1
		expect(value).toEqual(1);
		world.removeTag(entity, tags[0]);
		// entity not in query, value = 1
		expect(value).toEqual(1);
	});
	it('createQuery must throw error if tag not registered', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerTags(tags);
		const tag = 'NotRegisteredTag';
		expect(() => world.createQuery(['tag0', tag])).toThrowError(`Tag ${tag} is not registered`);
	});
	it('Add,remove, tag must throw error if tag not registered', () => {
		const world = new World(ENTITIES_COUNT);
		world.registerTags(tags);
		const tag = 'NotRegisteredTag';
		const entity = world.createEntity();
		expect(() => world.addTag(entity, tag)).toThrowError(`Tag ${tag} is not registered`);
		expect(() => world.removeTag(entity, tag)).toThrowError(`Tag ${tag} is not registered`);
		expect(() => world.hasTag(entity, tag)).toThrowError(`Tag ${tag} is not registered`);
	});
});
