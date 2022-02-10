import { Constructor } from '../../src/types';
import { World } from '../../src/World';

// eslint-disable-next-line import/prefer-default-export
export const createEntities = <T>(
  world: World,
  components: (Constructor<NonNullable<T>> | string)[],
  amount: number,
): Array<number> => {
  const entities = Array<number>();
  for (let i = 0; i < amount; i += 1) {
    const entity = world.createEntity();
    components.forEach((Component) => {
      if (typeof Component === 'string') {
        world.addTag(entity, Component);
      } else {
        world.addComponent(entity, new Component());
      }
    });
    entities.push(entity);
  }
  return entities;
};
