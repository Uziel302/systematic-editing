import { Component } from '@angular/core';

import { TyposService } from './typos/typos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'systematic-editing';

  constructor(
    public typosService: TyposService,
  ){}

  stringi (s: any){
    return JSON.stringify(s);
  }
}
