export interface System {
  /**
   * Method will be executed on every world update
   *
   * @param dt - time between frames
   */
  update?(dt: number): void;

  /**
   * Method will be executed on system exit from the world
   */
  exit?(): void;
}
