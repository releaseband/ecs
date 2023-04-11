import { System } from '../../../src';

export default class TestSystem1 implements System {
  testValue: number | null = null;

  update(dt: number): void {
    this.testValue = dt;
  }
}
