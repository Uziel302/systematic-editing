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
  public project: string = 'en.wikipedia';
  count0: number = 0;
  count1: number = 0;
  count2: number = 0;
  count3: number = 0;
  count4: number = 0;
  count5: number = 0;
  
  constructor(private http: HttpClient) {}

  changeProject(){
    this.suspectWord = this.emptySuspect;
    this.suspects = [];
    this.getTypos();
  }

  getTypos(): void {
    this.http.post<ITypo[]>(environment.apiEndPoint + 'api/getTypos', {project:this.project}).subscribe(
      (data) => {
        if (Object.keys(data).length === 0) {
          this.errorMessage =
            'All the typos were handled!';
        } else {
          this.suspects.push(...data);
          if (!this.suspectWord.suspect) {
            this.suspectWord = this.suspects.shift() ?? this.emptySuspect;
            this.generateContext();
          }
        }
      },
      (error) => {
        alert(error.error);
      }
    );
  }

  getStats(): void {
    this.http.post<any[]>(environment.apiEndPoint + 'api/getStats', {project:this.project}).subscribe(
      (data) => {
        this.count0 = this.count1 = this.count2 = this.count3 = this.count4 = this.count5 = 0;
        for(let datum of data){
          switch(datum?.status){
            case 0:
              this.count0 = datum?.count;
              break;
            case 1:
              this.count1 = datum?.count;
              break;
            case 2:
              this.count2 = datum?.count;
              break;
            case 3:
              this.count3 = datum?.count;
              break;
            case 4:
              this.count4 = datum?.count;
              break;
            case 5:
              this.count5 = datum?.count;
              break;
            default: 
              break;
          }
        }
      },
      (error) => {
        alert(error.error);
      }
    );
  }

  replaceTypo() {
    let id = this.suspectWord.id;
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
          alert(error.error);
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
          alert(error.error);
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
    this.generateContext();
    if (this.suspects.length < 3) {
      this.getTypos();
    }
  }

  getLink(suspect: ITypo) {
    return (
      'https://' + suspect.project + '.org/w/index.php?title=' + suspect.title
    );
  }

  generateContext(): void {
    this.suspectWord.fullContext =
      this.suspectWord.contextBefore +
      this.suspectWord.correction +
      this.suspectWord.contextAfter;
  }
}
