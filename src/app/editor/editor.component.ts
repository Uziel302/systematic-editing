import { Component, OnInit } from '@angular/core';
import { TyposService } from '../typos/typos.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  constructor(public typosService: TyposService) {}

  ngOnInit(): void {}

  linkify(title: string) {
    return (
      'https://' +
      this.typosService.suspectWord.project +
      '.org/wiki/' +
      title.replace(/ /g, '_')
    );
  }

  replace() {
    this.typosService.replaceTypo();
  }
}
