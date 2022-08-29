import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TyposService {
  public suspectWord = {};


  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  getTypos(): void {
    this.http.get(environment.apiEndPoint + 'wikitypos').subscribe(
      (data) => {
        this.suspectWord = data;
      },
      (error) => {
      }
    );
  }
}
