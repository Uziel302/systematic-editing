import { Component, OnInit } from '@angular/core';
import { LoginService } from './login/login.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'systematic-editing';

  constructor(
    private loginService: LoginService
  ){}

  ngOnInit(): void {
    this.loginService.autoAuthUser();
  }
}
