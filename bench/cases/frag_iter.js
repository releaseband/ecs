import { World } from '../../dist/World.js';

export default (count) => {
	const world = new World(1_000_000);

	class DataComponent {
		constructor() {
			this.value = 1;
		}
	}
	class Component {
		constructor() {
			this.value = 0;
		}
	}

	const COMPS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", (name) =>
		Function("Component", `return class ${name} extends Component {}`)(Component)
  	);

	COMPS.forEach( component =>	world.registerComponent(component));

	world.registerComponent(DataComponent);


	const query = world.createQuery([DataComponent]);


	for (let i = 0; i < count; i++) {
		for (const comp of COMPS) {
			const entity = world.createEntity();
			world.addComponent(entity,new comp())
			world.addComponent(entity,new DataComponent());
		}
  	}

	return () => {
		for (const entity of query.entities) {
			const component = world.getComponent(entity,DataComponent);
			component.value *= 2;
		}
	};
};
