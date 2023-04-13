import { System } from '../../../src';

export default class TestSystem2 implements System {
  public testValue: number | null = null;

  exit(): void {
    this.testValue = 12345;
  }
}
