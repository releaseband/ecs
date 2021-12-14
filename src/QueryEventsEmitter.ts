type Subscriber = {
  callback: CallableFunction;
  once: boolean;
};

export default class QueryEventsEmitter {
  private subscribers = Array<Subscriber>();

  /**
   * Add subscriber for the event
   *
   * @param cb - Callback that is triggered when the event is fired
   */
  subscribe(callback: CallableFunction, once = false): void {
    this.subscribers.push({ callback, once });
  }

  /**
   * Remove subscriber
   *
   * @param cb - Callback that you want to unsubscribe
   */
  unsubscribe(callback: CallableFunction): void {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber.callback !== callback
    );
  }

  /**
   * Fire event
   *
   * @param args - optional args that you want to pass to subscribers
   */
  emit<T extends unknown[]>(...args: T): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const subscriber of this.subscribers) {
      subscriber.callback(...args);
      if (subscriber.once) {
        this.unsubscribe(subscriber.callback);
      }
    }
  }
}
