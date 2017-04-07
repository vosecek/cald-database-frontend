import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'team'
})
@Injectable()
export class TeamPipe implements PipeTransform {

	constructor(private server: ServerService) {
	}


	transform(id: string, prop?: string) {
		let team = this.server.getType("team", id);
		if (!prop) prop = "name";
		return team[prop];
	}
}
