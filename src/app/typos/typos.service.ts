import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { ITypo } from '../models/typo';

@Injectable({ providedIn: 'root' })
export class TyposService {
  public suspects: ITypo[] = [];
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
    this.http.get<ITypo[]>(environment.apiEndPoint + 'typos').subscribe(
      (data) => {
        if (Object.keys(data).length === 0) {
          this.errorMessage = 'could not get new typos from server';
        } else {
          this.suspects = data;
          this.suspectWord = data[0];
        }
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

  dismissTypo(status: number) {
    this.http
      .post(environment.apiEndPoint + 'dismissTypo', {
        id: this.suspectWord.id,
        status,
      })
      .subscribe(
        (data) => {},
        (error) => {
          this.errorMessage = JSON.stringify(error.error);
        }
      );
  }
}
