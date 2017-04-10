import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ServerService } from '../../services/server.service';

@Injectable()
export class IsAdmin implements CanActivate {
	constructor(private server: ServerService) { }

	canActivate(): Promise<boolean> {
		return this.server.isAdmin();
	}
}