import { Component, signal } from "@angular/core";

@Component({
  templateUrl: "./counter.html",
})
export class CounterComponent {
  counter = 10;
  counterSignal = signal(10);

  increase(value: number) {
    this.counter += value;
    //this.counterSignal.set(this.counterSignal() + value);
    this.counterSignal.update((current) => current + value);
  }

  decrease(value: number) {
    this.counter -= value;
    this.counterSignal.update((current) => current - value);
  }

  resetCounter() {
    this.counter = 0;
    this.counterSignal.set(0);
  }
}
