export interface System {
	/**
	 * Method will be executed on every world update
	 *
	 * @param dt - time between frames
	 */
	update(dt: number): void;
}
