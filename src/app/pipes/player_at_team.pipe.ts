import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { ServerService } from '../services/server.service';
import { TeamsService } from '../services/teams.service';
import { TeamPipe } from './team.pipe';

@Pipe({
	name: 'player_at_team'
})
@Injectable()
export class PlayerAtTeam implements PipeTransform {

	constructor(
		private server: ServerService,
		private teams: TeamsService,
		private team: TeamPipe
	) {
	}


	transform(player: any, name?: boolean): any {
		let player_at_team = this.server.getType("player_at_team", player['id'], null, 'player_id');
		if (player_at_team) {
			let data = this.teams.getTeam(player_at_team['team_id']);
			if (name) {
				return data['name'];
			} else {
				return data;
			}
		} else {
			return false;
		}
	}
}
