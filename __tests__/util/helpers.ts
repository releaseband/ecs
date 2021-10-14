import { World } from '../../src/World';
import { Constructor } from '../../src/Helpers';

export const createEntities = <T>(
  world: World,
  components: (Constructor<NonNullable<T>> | string)[],
  amount: number
): Array<number> => {
  const entities = Array<number>();
  for (let i = 0; i < amount; i++) {
    const entity = world.createEntity();
    components.forEach((component) => {
      if (typeof component === 'string') {
        world.addTag(entity, component);
      } else {
        world.addComponent(entity, new component());
      }
    });
    entities.push(entity);
  }
  return entities;
};
