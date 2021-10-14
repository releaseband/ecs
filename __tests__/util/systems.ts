import { System } from '../../src/System';

export class TestSystem0 implements System {
  testValue: number | null = null;
  update(dt: number): void {
    this.testValue = dt;
  }
}

export class TestSystem1 implements System {
  public testValue: number | null = null;
  update(dt: number): void {
    this.testValue = dt;
  }
}

export class TestSystem2 implements System {
  public testValue: number | null = null;
  exit(): void {
    this.testValue = 12345;
  }
}
