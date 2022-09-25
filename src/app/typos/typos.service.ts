import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { ITypo } from '../models/typo';

@Injectable({ providedIn: 'root' })
export class TyposService {
  public suspectWord: ITypo = {
    id: 0,
    suspect: '',
    correction: '',
    title: '',
    contextBefore: '',
    contextAfter: '',
    project: '',
  };
  public successMessage: string = '';
  public errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  getTypos(): void {
    this.http
      .get<{ suspect: any }>(environment.apiEndPoint + 'typos')
      .subscribe(
        (data) => {
          this.suspectWord = data.suspect;
        },
        (error) => {}
      );
  }

  replaceTypo() {
    this.http
      .post(environment.apiEndPoint + 'replaceTypo', this.suspectWord)
      .subscribe(
        (data) => {
          this.successMessage = 'Success! Click to view the edit';
        },
        (error) => {
          this.errorMessage = JSON.stringify(error.error);
        }
      );
  }
}
