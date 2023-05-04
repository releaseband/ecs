import { World } from '../src/World';
import {
  TestComponentA,
  TestComponentB,
  TestComponentC,
  TestComponentD,
  TestComponentE,
} from './components';

// TODO: добавить другие фреймворки для сравнения
export const AMOUNT = 1_000;

export function init(): World {
  const world = new World(1_000_000);

  world.registerComponents([
    TestComponentA,
    TestComponentB,
    TestComponentC,
    TestComponentD,
    TestComponentE,
  ]);
  return world;
}
