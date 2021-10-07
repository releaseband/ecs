export class EventsEmitter {
  private events: { [event: string]: Set<CallableFunction> } = {};

  on(event: string, callback: CallableFunction): EventsEmitter {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    const listeners = this.events[event];
    listeners.add(callback);

    return this;
  }

  remove(event: string, callback: CallableFunction): EventsEmitter {
    if (this.events[event]) {
      const listeners = this.events[event];
      listeners.delete(callback);
    }
    return this;
  }

  emit<T>(event: string, arg?: T): void {
    if (this.events[event]) {
      for (const listener of this.events[event]) {
        listener(arg);
      }
    }
  }
}
