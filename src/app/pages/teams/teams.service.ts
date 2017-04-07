import { Injectable, OnInit } from '@angular/core';
import { ServerService } from '../../services/server.service';
import { Observable } from 'rxjs/Rx';

import { Team } from '../../types/team';

@Injectable()
export class TeamsService {

	private teams: Team[];

	constructor(private server: ServerService) {
	}

	public getTeamPlayers(id: number): Observable<any> {
		return this.server.get('list/player_at_team', { 'filter': { 'team_id': id }, 'extend': true }).map(players => players);
	}

	public getTeam(id: number): any {
		if(!id) return;
		return this.teams.find(team => team.id == id.toString());
	}

	public getTeams(): Observable<any> {
		return this.loadTeams().map(() => this.teams);
	}

	private loadTeams(): Observable<any> {
		return this.server.get('list/team').map((teams) => {
			this.teams = teams;
		});
	}
}
