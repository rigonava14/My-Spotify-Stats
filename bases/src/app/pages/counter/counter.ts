import { Component } from "@angular/core";

@Component({
  template: `
  <h1>Counter {{counter}}</h1>
  <button (click)="increase(1)">Increment</button>
  <button (click)="decrease(1)">Decrement</button>
    <h2>Counter Component</h2>
    `
})
export class CounterComponent {
  counter = 10;

  increase(value: number) {
    this.counter += value;
  }

  decrease(value: number) {
    this.counter -= value;
  }
}
