import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ITypo } from '../models/typo';

@Injectable({ providedIn: 'root' })
export class TyposService {
  public suspects: ITypo[] = [];
  public suspectsInProcess: ITypo[] = [];
  public emptySuspect = {
    id: 0,
    suspect: '',
    correction: '',
    title: '',
    contextBefore: '',
    contextAfter: '',
    project: '',
    response: '',
    responseLink: '',
  };
  public suspectWord: ITypo = this.emptySuspect;
  public errorMessage: string = '';

  constructor(private http: HttpClient) {}

  getTypos(): void {
    this.http.get<ITypo[]>(environment.apiEndPoint + 'typos').subscribe(
      (data) => {
        if (Object.keys(data).length === 0) {
          this.errorMessage = 'could not get new typos from server';
        } else {
          this.suspects = data;
          this.suspectWord = data.shift() ?? this.emptySuspect;
        }
      },
      (error) => {}
    );
  }

  replaceTypo() {
    let id = this.suspectWord.id;
    this.http
      .post(environment.apiEndPoint + 'replaceTypo', this.suspectWord)
      .subscribe(
        (data) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = 'Success! Click to view the edit';
              suspect.responseLink = this.getLink(suspect);
              break;
            }
          }
        },
        (error) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = error.error;
            }
          }
        }
      );
    this.markInProcess();
  }

  dismissTypo(status: number) {
    let id = this.suspectWord.id;
    this.http
      .post(environment.apiEndPoint + 'dismissTypo', {
        id: this.suspectWord.id,
        status,
      })
      .subscribe(
        (data) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = status === 3 ? 'skipped' : 'dismissed';
            }
          }
        },
        (error) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = error.error;
            }
          }
        }
      );
    this.markInProcess();
  }

  markInProcess() {
    this.suspectsInProcess.unshift(this.suspectWord);
    this.suspectWord = this.suspects.shift() ?? this.emptySuspect;
  }

  getLink(suspect: ITypo){
    return 'https://' +
    suspect.project +
    '.org/w/index.php?title=' +
    suspect.title +
    '&diff=curr&oldid=prev';
  }
}
