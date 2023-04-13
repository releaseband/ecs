import { System } from '../../../src';

export default class SystemForEnableDisableTest implements System {
  public isEnabled = true;

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}
