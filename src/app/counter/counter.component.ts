import { Subject, merge, timer, combineLatest, EMPTY, Observable } from 'rxjs';
import { mapTo, map,startWith, withLatestFrom, switchMap, tap, pluck } from 'rxjs/operators';
import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { RxState, stateful, distinctUntilSomeChanged, selectSlice } from '@rx-angular/state';
interface InputEvent {
  target: {
    value: any
  }
}
interface CounterState {
  title: string;
    isTicking: boolean,
    count: number,
    countUp: boolean,
    tickSpeed: number,
    countDiff: number
  };
const initialCounterState = {
  title: 'Dynamic Counter',
    isTicking: false,
    count: 0,
    countUp: true,
    tickSpeed: 200,
    countDiff: 1
  };
  
@Component({
  selector: 'counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent extends RxState<CounterState>  {
  counterForm = this.fb.group({
    tickSpeed: [],
    count: [],
    countDiff: []
  });
  counterForm$ = this.counterForm.valueChanges;

  isTickingChange$: Subject<boolean> = new Subject<boolean>();
  btnSetToClick$: Subject<Event> = new Subject<Event>();
  countUpChange$: Subject<boolean> = new Subject<boolean>();
  resetClick$: Subject<Event> = new Subject<Event>();

  vm$ = this.select(selectSlice(['count', 'title']));

  constructor(private fb: FormBuilder) {
    super();
    this.set(initialCounterState);
    this.counterForm.patchValue(initialCounterState)

    this.connect('isTicking', this.isTickingChange$);
    this.connect('countUp', this.countUpChange$);
    this.connect(this.resetClick$.pipe(mapTo(initialCounterState)));

    this.connect(this.counterForm$.pipe(pluckDistinct( 'tickSpeed')));
    this.connect(this.counterForm$.pipe(pluckDistinct( 'countDiff')));

    this.connect(this.btnSetToClick$.pipe(
      withLatestFrom(this.counterForm$.pipe(pluckDistinct('count'))
        .pipe(startWith({count:initialCounterState.count}))
      ), 
      map(([e, slice]) => slice))
    );

    const tick$ = combineLatest(this.select('isTicking'), this.select('tickSpeed'))
      .pipe(switchMap(([isTicking, ms]) => isTicking ? timer(0, ms): EMPTY));
    this.connect('count', tick$, (s, _) => s.count + (s.countUp ? 1 : -1)* s.countDiff);
  }

}

function  pluckDistinct<T>(key: string) {
    return o$ => o$.pipe(stateful(pluck(key), 
    map(v => ({[key]: v}))))
  }
