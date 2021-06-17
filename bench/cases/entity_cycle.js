import { World } from '../../dist/World.js';

export default (count) => {
	const world = new World(1_000_000);

	class TestComponentA {
		constructor() {
			this.value = 0;
		}
	}
	class TestComponentB {
		constructor() {
			this.value = 1;
		}
	}

	world.registerComponent(TestComponentA);
	world.registerComponent(TestComponentB);

	const queryA = world.createQuery([TestComponentA]);
    const queryB = world.createQuery([TestComponentB]);

	for (let i = 0; i < count; i++) {
		const entity = world.createEntity();
		world.addComponent(entity,new TestComponentA())	
	}

	return () => {

		for (const entity of queryA.entities) {
			const entity0 = world.createEntity();
			world.addComponent(entity0,new TestComponentB())	
			const entity1 = world.createEntity();
			world.addComponent(entity1,new TestComponentB())	
		}

		for (const entity of queryB.entities) {
			world.removeEntity(entity);
		}

	};
};
