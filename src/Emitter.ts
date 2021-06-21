export class Emitter {
	private subscribers: CallableFunction[] = [];

	sub(cb: CallableFunction): void {
		this.subscribers.push(cb);
	}

	unsub(cb: CallableFunction): void {
		this.subscribers = this.subscribers.filter((callback) => callback === cb);
	}

	emit<T extends unknown[]>(...args: T): void {
		for (const subscriber of this.subscribers) {
			subscriber(...args);
		}
	}
}
