import { Injectable, OnInit } from '@angular/core';
import { ServerService } from './server.service';
import { Observable } from 'rxjs/Rx';

import { User } from '../pages/user/user';

@Injectable()
export class UserService {

	constructor(private server: ServerService) {
	}

	public updateUser(data: any): Observable<any> {
		return this.server.put("user/me", data);
	}
}
