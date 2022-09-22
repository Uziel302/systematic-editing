import { Component, OnInit } from '@angular/core';
import { TyposService } from '../typos/typos.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  constructor(
    public typosService: TyposService,
  ) { }

  ngOnInit(): void {
  }

  stringi (s: any){
    return JSON.stringify(s);
  }
}
