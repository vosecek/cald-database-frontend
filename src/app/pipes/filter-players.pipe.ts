import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'filterPlayers',
	// pure: false
})
@Injectable()
export class FilterPlayersPipe implements PipeTransform {

	constructor(
		private server: ServerService) {
	}


	transform(data: any[], query: string): any {
		if (query.length < 3) {
			return data;
		}
		query = query.toLowerCase();
		return data.filter(item => {
			if (item.first_name.toLowerCase().search(query) > -1 || item.last_name.toLowerCase().search(query) > -1) {
				return true;
			}
		});
	}
}
