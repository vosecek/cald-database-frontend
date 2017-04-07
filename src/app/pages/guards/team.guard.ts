import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ServerService } from '../../services/server.service';
import { ActivatedRoute, Params, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class TeamGuard implements CanActivate {
	constructor(
		private server: ServerService,
		private route: ActivatedRoute
	) { }

	canActivate(router: ActivatedRouteSnapshot): boolean {
		if (this.server.permission(router.params['id'])) {
			return true;
		}
		return false;
	}
}