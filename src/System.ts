import { World } from './World';

export interface System {
	/**
	 * Method will be executed on every world update
	 *
	 * @param {number} dt time between frames
	 */
	update(dt: number): void;
}
