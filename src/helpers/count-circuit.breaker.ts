export class CircuitBreakerError extends Error {
  constructor() {
    super("Circuit broken via exception to avoid infinite loop.");
  }
}

export class CountCircuitBreaker {
  constructor(private work_to_do: number) {
  }

  work() {
    this.work_to_do--;

    if (this.work_to_do < 0) {
      throw new CircuitBreakerError();
    }
  }

  shouldBreak() {
    return this.work_to_do === 0;
  }
}
