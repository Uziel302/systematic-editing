import { Component, OnInit } from '@angular/core';

import { LoginService } from '../login/login.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  public environment = environment;

  constructor(public loginService: LoginService) {}

  ngOnInit(): void {}

  logout() {
    this.loginService.username = '';
    this.loginService.clearSession();
  }
}
