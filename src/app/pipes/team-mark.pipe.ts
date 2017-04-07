import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'teammark'
})
@Injectable()
export class TeamMarkPipe implements PipeTransform {

	constructor(private server: ServerService) {
	}


	transform(id: number, prop?: string) {
		return String.fromCharCode(97 + id).toUpperCase(); 
	}
}
