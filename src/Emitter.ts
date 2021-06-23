export class Emitter {
	private subscribers: CallableFunction[] = [];

	/**
	 * Add subscriber for the event
	 *
	 * @param cb - Callback that is triggered when the event is fired
	 */
	subscribe(cb: CallableFunction): void {
		this.subscribers.push(cb);
	}

	/**
	 * Remove subscriber
	 *
	 * @param cb - Callback that you want to unsubscribe
	 */
	unsubscribe(cb: CallableFunction): void {
		this.subscribers = this.subscribers.filter((callback) => callback !== cb);
	}

	/**
	 * Fire event
	 *
	 * @param args - optional args that you want to pass to subscribers
	 */
	emit<T extends unknown[]>(...args: T): void {
		for (const subscriber of this.subscribers) {
			subscriber(...args);
		}
	}
}
