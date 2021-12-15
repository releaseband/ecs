type Listener = {
  callback: CallableFunction;
  once: boolean;
};

export default class EventsEmitter {
  private events: Map<string, Array<Listener>> = new Map();

  on(event: string, callback: CallableFunction, once = false): EventsEmitter {
    let listeners = this.events.get(event);
    if (!listeners) {
      listeners = [];
      this.events.set(event, listeners);
    }
    listeners.push({ callback, once });

    return this;
  }

  remove(event: string, callback: CallableFunction): EventsEmitter {
    const listeners = this.events.get(event);
    if (listeners) {
      this.events.set(
        event,
        listeners.filter((listener) => listener.callback !== callback)
      );
    }
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener.callback(...args));
      this.events.set(
        event,
        listeners.filter((listener) => !listener.once)
      );
    }
  }
}
