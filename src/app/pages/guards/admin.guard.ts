import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { ServerService } from '../../services/server.service';

@Injectable()
export class IsAdmin implements CanLoad {
	constructor(private server: ServerService) { }

	canLoad(): boolean {
		return this.server.isAdmin();
	}
}