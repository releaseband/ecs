import { ComponentInstance, Constructor, World } from '../../src';

export const createEntities = <T>(
  world: World,
  components: (Constructor<ComponentInstance<T>> | string)[],
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
