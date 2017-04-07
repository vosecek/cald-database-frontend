import { Injectable, OnInit } from '@angular/core';
import { ServerService } from './server.service';
import { Observable } from 'rxjs/Rx';

import { Team } from '../types/team';

@Injectable()
export class TeamsService {

	constructor(private server: ServerService) {
	}

	public getTeamPlayers(id: number): Observable<any> {
		return this.server.get('list/player_at_team', { 'filter': { 'team_id': id }, 'extend': true }).map(players => players);
	}

	public getTeam(id: number): any {
		return this.server.getType("team").find(team => team.id == id.toString());
	}
}
