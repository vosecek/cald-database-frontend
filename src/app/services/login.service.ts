import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Token } from '../pages/login/token.component';
import { Observable } from 'rxjs/Rx';

import { ServerService } from './server.service';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class LoginService {
  private Token: Token;

  constructor(
    private http: Http,
    private server: ServerService
  ) {
  }

  public login(login: string, password: string): Observable<Token> {
    let body = JSON.stringify({ login, password });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.server.api + "user/login", body, options).map(this.extractData).catch(this.handleError);
  }

  public setToken(token: Token) {
    localStorage.setItem('agent', JSON.stringify(token));
  }

  public isLogged(): boolean {
    if(this.getToken()){
      let token = this.getToken();
      console.log(token);
      return true;
    }else{
      return false;
    }
  }

  public getToken(): Token {
    return JSON.parse(localStorage.getItem('agent'));
  }

  public validity() {
    return this.Token.valid_until;
  }

  public canEdit(): void {
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.token || {};
  }

  private handleError(error: any) {
    let errMsg = error.json();
    return Observable.throw(errMsg.error);
  }

}
