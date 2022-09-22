import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginService {
  public username: string = '';

  public autoAuthUser(){
    this.username = localStorage.getItem('username') ?? '';
  }
}
