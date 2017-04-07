import { Injectable, OnInit } from '@angular/core';
import { ServerService } from './server.service';
import { Observable } from 'rxjs/Rx';

import { Team } from '../types/team';
import { Player } from '../types/player';

@Injectable()
export class PlayerService {

	constructor(
		private server: ServerService
		) {
	}

	private preparePlayerData(player: Player): any {
		let data = {};
		data['first_name'] = player.first_name;
		data['last_name'] = player.last_name;
		data['birth_date'] = player.birth_date;
		data['sex'] = player.sex;
		data['email'] = player.email;
		return data;
	}

	public createPlayer(player: Player): Observable<any> {
		return this.server.post('player', this.preparePlayerData(player));
	}

	public updatePlayer(player: Player): void {
		let data = this.preparePlayerData(player);

		this.server.post('player/' + player.id, data).subscribe(val => {
		}, err => {
			alert(err);
		}, () => {
		});
	}

	public assignPlayer2Team(player:Player,team:Team): Observable<any> {
		return this.server.post('/team/' + team.id + '/player/' + player.id);
	}
}
