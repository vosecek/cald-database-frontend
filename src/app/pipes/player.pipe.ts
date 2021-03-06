import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';

@Pipe({
	name: 'player'
})
@Injectable()
export class PlayerPipe implements PipeTransform {

	constructor(private server: ServerService) {
	}


	transform(id: string, prop?: string): any {
		let player = this.server.getType("player", id);
		if(!player){
			return false;
		}
		if (!prop) {
			let data = [player["last_name"], player["first_name"]].join(" ");
			return data;
		} else {
			return player[prop];
		}
	}
}
