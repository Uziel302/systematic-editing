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
    fullContext: '',
    origFullContext: '',
    project: '',
    response: '',
    responseLink: '',
  };
  public suspectWord: ITypo = this.emptySuspect;
  public errorMessage: string = '';

  constructor(private http: HttpClient) {}

  getTypos(): void {
    this.http.get<ITypo[]>(environment.apiEndPoint + 'api/typos').subscribe(
      (data) => {
        if (Object.keys(data).length === 0) {
          this.errorMessage = 'could not get new typos from server';
        } else {
          this.suspects.push(...data);
          if (!this.suspectWord.suspect) {
            this.suspectWord = this.suspects.shift() ?? this.emptySuspect;
          }
        }
      },
      (error) => {}
    );
  }

  replaceTypo() {
    let id = this.suspectWord.id;
    this.suspectWord.fullContext =
      (document.getElementById('contextBefore') as HTMLElement).innerText +
      (document.getElementById('correction-in-context') as HTMLElement)
        .innerText +
      (document.getElementById('contextAfter') as HTMLElement).innerText;
    this.http
      .post(environment.apiEndPoint + 'api/replaceTypo', this.suspectWord)
      .subscribe(
        (data) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = 'Success! Click to view the edit';
              suspect.responseLink =
                this.getLink(suspect) + '&diff=curr&oldid=prev';
              break;
            }
          }
        },
        (error) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = error.error;
              break;
            }
          }
        }
      );
    this.markInProcess();
  }

  dismissTypo(status: number) {
    let id = this.suspectWord.id;
    this.http
      .post(environment.apiEndPoint + 'api/dismissTypo', {
        id: this.suspectWord.id,
        status,
      })
      .subscribe(
        (data) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = status === 3 ? 'skipped' : 'dismissed';
              break;
            }
          }
        },
        (error) => {
          for (let suspect of this.suspectsInProcess) {
            if (suspect.id === id) {
              suspect.response = error.error;
              break;
            }
          }
        }
      );
    this.markInProcess();
  }

  markInProcess() {
    this.suspectsInProcess.unshift(this.suspectWord);
    this.suspectWord = this.suspects.shift() ?? this.emptySuspect;
    if (this.suspects.length < 3) {
      this.getTypos();
    }
  }

  getLink(suspect: ITypo) {
    return (
      'https://' + suspect.project + '.org/w/index.php?title=' + suspect.title
    );
  }
}
