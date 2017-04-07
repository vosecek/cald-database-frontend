import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'division'
})
@Injectable()
export class DivisionPipe implements PipeTransform {

	constructor(private server: ServerService) {
	}


	transform(id: string, prop?: string) {
		let division = this.server.getType("division", id);
		if (!prop) prop = "name";
		return division[prop];
	}
}
