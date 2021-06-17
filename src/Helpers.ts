declare global {
	interface Object {
		index: number;
	}
}

export type Constructor<T> = { new (...args: any[]): T };
