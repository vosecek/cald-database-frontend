import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { LoginService } from '../../services/login.service';
import { ServerService } from '../../services/server.service';
import { Token } from './token.component';
import { Router } from '@angular/router';

import 'style-loader!./login.scss';

@Component({
  selector: 'login',
  templateUrl: './login.html',
})
export class Login {

  errorMessage: string = '';
  public form: FormGroup;
  public submitted: boolean = false;
  private username: AbstractControl;
  private password: AbstractControl;

  sending: boolean = false;

  constructor(
    fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private server: ServerService
  ) {
    if (this.loginService.isLogged()) {
      this.logged();
    }
    this.form = fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required]
    });

    this.username = this.form.get('username');
    this.password = this.form.get('password');
  }

  logged(): void {
    this.errorMessage = '';
    this.router.navigate(['/dashboard']);
  }

  invalid(error: string) {
    alert(error);
    this.form.patchValue({ "password": "" });
    this.errorMessage = error;
  }

  onSubmit(): void {
    this.sending = true;
    this.loginService.login(this.form.get('username').value, this.form.get('password').value).subscribe(
      token => {
        this.loginService.setToken(token);
        this.logged();
      },
      error => {
        this.sending = false;
        this.invalid(error);
      });
  }
}
