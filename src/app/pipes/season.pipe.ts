import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'season'
})
@Injectable()
export class SeasonPipe implements PipeTransform {

	constructor(private server: ServerService) {
	}


	transform(id: string, prop?: string) {
		let division = this.server.getType("season", id);
		if (!prop) prop = "name";
		return division[prop];
	}
}
