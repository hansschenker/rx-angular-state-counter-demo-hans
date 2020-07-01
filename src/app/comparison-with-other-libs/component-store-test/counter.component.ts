import { Subject, merge, timer, combineLatest, EMPTY } from 'rxjs';
import { mapTo, map, withLatestFrom, switchMap, tap } from 'rxjs/operators';
import { Component, Input } from '@angular/core';
import { ComponentStore } from './component-store';
interface InputEvent {
  target: {
    value: any
  }
}
interface CounterState {
    isTicking: boolean,
    count: number,
    countUp: boolean,
    tickSpeed: number,
    countDiff: number
  };
const initialCounterState = {
    isTicking: false,
    count: 0,
    countUp: true,
    tickSpeed: 200,
    countDiff: 1
  };
  
@Component({
  selector: 'component-store-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class ComponentStoreCounterComponent extends ComponentStore<CounterState>  {
  initialCounterState = initialCounterState;
  
  btnSetTo: Subject<Event> = new Subject<Event>();
  inputTickSpeed: Subject<InputEvent> = new Subject<InputEvent>();
  inputCountDiff: Subject<InputEvent> = new Subject<InputEvent>();
  inputSetTo: Subject<InputEvent> = new Subject<InputEvent>();

  count$ = this.select(s => s.count);
  tickSpeed$ = this.select(s => s.tickSpeed);
  countDiff$ = this.select(s => s.countDiff);

  constructor() {
    super(initialCounterState);
    this.updater((state) => this.initialCounterState);

    const updateStateFn = this.updater((s: CounterState, partial: Partial<CounterState>) => ({...s, ...partial}));
    updateStateFn(this.select(s => s));

 const updateTickSpeedFn = this.updater((s: CounterState, tickSpeed:number) => ({...s, tickSpeed}));
    updateTickSpeedFn( this.inputTickSpeed
      .pipe(map(e => e.target.value)));


 const updateCountDiffFn = this.updater((s: CounterState, countDiff:number) => ({...s, countDiff}));
    updateCountDiffFn( this.inputCountDiff
      .pipe(map(e => e.target.value)));

  const setTo$ = this.inputSetTo.pipe(map(e => parseInt(e.target.value)));
  const updateCountFn = this.updater((s: CounterState, count:number) => ({...s, count}));
  updateCountFn( this.btnSetTo.pipe(
      withLatestFrom(setTo$), map(([e, input]) => input)));


   const tick$ = combineLatest(this.select(s => s.isTicking), this.select(s => s.tickSpeed))
      .pipe(switchMap(([isTicking, ms]) => isTicking ? timer(0, ms): EMPTY));

 const autoUpdateCountFn = this.updater((s, _) => s.count + (s.countUp ? 1 : -1)* s.countDiff);
    autoUpdateCountFn(tick$.pipe(tap(console.log)));
 

  }

}
