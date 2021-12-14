export default class EventsEmitter {
  private events: { [event: string]: Set<CallableFunction> } = {};

  on(event: string, callback: CallableFunction): EventsEmitter {
    let listeners = this.events[event];
    if (!listeners) {
      listeners = new Set();
      this.events[event] = listeners;
    }
    listeners.add(callback);
    return this;
  }

  remove(event: string, callback: CallableFunction): EventsEmitter {
    const listeners = this.events[event];
    if (listeners) {
      listeners.delete(callback);
    }
    return this;
  }

  emit<T>(event: string, arg?: T): void {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach((listener) => listener(arg));
    }
  }
}
