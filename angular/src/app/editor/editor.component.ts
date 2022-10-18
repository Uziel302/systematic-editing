import { Component, OnInit } from '@angular/core';

import { LoginService } from '../login/login.service';
import { TyposService } from '../typos/typos.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  constructor(
    public typosService: TyposService,
    public loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.typosService.getTypos();
  }

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

  dismiss() {
    this.typosService.dismissTypo(2);
  }

  skip() {
    this.typosService.dismissTypo(3);
  }

  template() {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });

    this.typosService.suspectWord.correction =
      this.typosService.suspectWord.suspect +
      '{{typo help inline|reason=similar to ' +
      this.typosService.suspectWord.correction +
      '|date=' +
      month +
      ' ' +
      date.getFullYear() +
      '}}';
    setTimeout(() => {
      this.typosService.replaceTypo();
    }, 10);
  }

  prompt() {
    let suspect = this.typosService.suspectWord.suspect;
    let approvedCorrection = prompt(
      suspect + ' will be replaced by: ',
      suspect
    );
    if (approvedCorrection === null || approvedCorrection === suspect) return;
    this.typosService.suspectWord.correction = approvedCorrection;
  }
}
