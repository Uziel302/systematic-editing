import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient) {}

  public username: string = '';

  public autoAuthUser() {
    this.http
      .get<{ username: string }>(environment.apiEndPoint + 'api/checkSession')
      .subscribe(
        (data) => {
          this.username = data.username;
        },
        (error) => {}
      );
  }

  clearSession() {
    this.http.get(environment.apiEndPoint + 'api/clearSession').subscribe(
      (data) => {},
      (error) => {}
    );
  }
}
