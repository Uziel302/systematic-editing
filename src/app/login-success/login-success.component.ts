import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css'],
})
export class LoginSuccessComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loginService.username = this.route.snapshot.paramMap.get('name') ?? '';
    localStorage.setItem('username', this.loginService.username);
    if (this.loginService.username) {
      this.router.navigate(['/']);
    }
  }
}
