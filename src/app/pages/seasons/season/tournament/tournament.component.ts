import { Component, OnInit } from '@angular/core';
import { Season } from '../../../../types/season';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../../../services/server.service';

import { TournamentExtended } from '../../../../types/tournamentextended';
import { Tournament } from '../../../../types/tournament';

import { PlayerPipe } from '../../../../pipes/player.pipe';

@Component({
	selector: 'tournament',
	styles: [],
	providers: [PlayerPipe],
	templateUrl: 'tournament.html'
})

export class TournamentComponent {

	season: Season;
	tournament: Tournament;
	divisions: TournamentExtended[];
	rosters: any[];
	colClass: string;
	rights: any[];
	teams: any[];
	addTeam: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		public server: ServerService,
		private playerPipe: PlayerPipe
	) {
		this.season = new Season;
		this.tournament = new Tournament;
	}

	public roster(r: any, id?: number): void {
		console.log(r);
		if (!id) {
			this.router.navigateByUrl([this.router.url, r.tournament_belongs_to_league_and_division_id, r.id].join("/"));
		} else {
			this.server.post("roster", { team_id: id, tournament_belongs_to_league_and_division_id: r.id }).subscribe(val => {
				this.ngOnInit();
			});
		}
	}

	private detectMark(roster: any): void {
		var teams = {};
		roster.forEach(el => {
			if (!teams[el.team_id]) {
				teams[el.team_id] = 0;
			}
			el.mark = teams[el.team_id];
			teams[el.team_id]++;
		});
	}

	ngOnInit(): void {
		this.divisions = [];
		this.teams = this.server.getType("team");
		this.route.params.forEach((params: Params) => {
			let tournament = +params['tournament'];
			this.server.get("list/tournament", { 'filter': { 'id': tournament }, 'extend': true }).subscribe(data => {
				data[0].date = new Date(data[0].date.split(" ")[0]);
				this.tournament = data[0];

				this.season = this.tournament['season'];
				this.divisions = this.server.getTournaments2league(this.tournament.id);

				this.colClass = 'col-xl-12';
				if (this.divisions.length == 1) this.colClass = 'col-xl-12';
				if (this.divisions.length == 2) this.colClass = 'col-xl-6';
				if (this.divisions.length == 3) this.colClass = 'col-xl-4';

				this.rights = this.server.getTeam2Edit();
				this.divisions.forEach(record => {
					record.rosters = [];
					record['userRosters'] = [];
					this.server.get("list/roster", { 'filter': { 'tournament_belongs_to_league_and_division_id': record.id } }).subscribe(data => {
						record.rosters = data;
						this.detectMark(record.rosters);
						record.rosters.forEach((roster) => {
							if (this.rights.indexOf(roster.team_id) > -1) {
								if (!record['userRosters'][roster.team_id]) record['userRosters'][roster.team_id] = [];
								record['userRosters'][roster.team_id].push(roster);
							}
							roster.hide = true;
							roster.name = this.server.getType("team", roster.team_id, "name");
							this.server.get("list/player_at_roster", { 'filter': { 'roster_id': roster.id } }).subscribe(data => {
								roster.players = data;
								roster.players.forEach(record => {
									record.name = this.playerPipe.transform(record.player_id);
								});
							});
						});
					});
				});
			});
		});
	}
}
