import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'; 
import { ReactiveFormsModule } from '@angular/forms';
import {TemplateModule} from '@rx-angular/template';

import { ToArrayPipe } from './to-array.pipe';
import { AppComponent } from './app.component';
import { CounterComponent } from './counter/counter.component';

@NgModule({
  imports:      [ BrowserModule, ReactiveFormsModule, TemplateModule],
  declarations: [ ToArrayPipe, AppComponent, CounterComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
