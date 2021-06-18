export class Emitter {
	private subscribers: CallableFunction[] = [];

	sub(cb: Function): void {
		this.subscribers.push(cb);
	}

	unsub(cb: CallableFunction): void {
		this.subscribers = this.subscribers.filter((callback) => callback === cb);
	}

	emit<T extends any[]>(...args: T): void {
		for (const subscriber of this.subscribers) {
			subscriber(...args);
		}
	}
}
