import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ServerService } from '../../services/server.service';

@Injectable()
export class DataLoaded implements Resolve<any> {
	constructor(private server: ServerService) { }

	resolve(): Promise<any> {
		return this.server.init();
	}
}