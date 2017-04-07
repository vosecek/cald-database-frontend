import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Season } from '../../../../../types/season';
import { Player } from '../../../../../types/player';
import { Team } from '../../../../../types/team';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../../../../services/server.service';

// import { TournamentExtended } from '../../../../types/tournamentextended';
// import { Tournament } from '../../../../types/tournament';

import { PlayerPipe } from '../../../../../pipes/player.pipe';
import { TeamMarkPipe } from '../../../../../pipes/team-mark.pipe';

@Component({
	selector: 'roster',
	styleUrls: ['./roster.scss'],
	providers: [PlayerPipe],
	templateUrl: 'roster.html',
	// changeDetection: ChangeDetectionStrategy.OnPush
})

export class RosterComponent {

	private id: number;
	roster: any[];
	teams: Team[];

	selectedTeam: number;

	public players2roster: Player[] = [];
	public availablePlayers: Player[] = [];
	public usedPlayers: any[];

	public teamMark: string = "";

	queryTeam: string = "";

	private originPlayers2roster: Player[] = [];

	constructor(
		private route: ActivatedRoute,
		private server: ServerService,
		private playerPipe: PlayerPipe,
		private teamMarkPipe: TeamMarkPipe,
		private router: Router
	) {
	}

	loadTeam(): void {
		this.availablePlayers = [];
		this.server.get('list/player_at_team', { filter: { "team_id": this.selectedTeam }, extend: true }).subscribe(val => {
			let players = [];
			val.forEach(el => {
				players.push(el.player);
			});
			this.availablePlayers = players;
		});
	}

	add(player: Player): void {
		this.players2roster.push(player);
	}

	remove(player: Player): void {
		let toRemove = this.players2roster.filter(item => item.id == player.id);
		let i = this.players2roster.indexOf(toRemove[0]);
		this.players2roster.splice(i, 1);
	}

	save(): void {
		let toAdd = this.players2roster.filter(item => this.originPlayers2roster.indexOf(item) < 0);
		let toDelete = this.originPlayers2roster.filter(item => this.players2roster.indexOf(item) < 0);

		toAdd.forEach(item => { 
			this.server.post(["roster",this.id,"player",item.id].join("/")).subscribe(el=>{
				console.log(el);
			});
		});

		toDelete.forEach(item => {
			this.server.delete(["roster", this.id, "player", item.id].join("/")).subscribe(el => {
				console.log(el);
			});
		});
	}

	delete(): void {
		let ok = confirm("Opravdu smazat soupisku týmu " + this.teamMark + "?");
		if (ok) {
			this.server.delete('roster/' + this.id).subscribe(val => {
				this.router.navigateByUrl(this.tournamentUrl());
			});
		}
	}

	private tournamentUrl(): string {
		let url = this.router.url.split("/");
		url.pop();
		return url.join("/");
	}

	ngOnInit(): void {
		this.teams = this.server.getType("team");
		this.route.params.forEach((params: Params) => {
			this.id = params['roster'];
		});

		let rights = this.server.getTeam2Edit();
		this.selectedTeam = rights[0];
		this.loadTeam();

		if (this.id) {
			this.server.get("list/roster", { 'extend': true, 'filter': { 'id': this.id } }).subscribe(val => {
				console.log(val);
				if (val.length == 0) {
					this.router.navigateByUrl(this.tournamentUrl());
				}
				this.roster = val[0];
				this.server.get("list/roster", { filter: { 'tournament_belongs_to_league_and_division_id': this.roster['tournament_belongs_to_league_and_division']['id'] } }).subscribe(val => {
					let teams = val.filter(item => item.team_id == this.roster['team']['id']);
					var i = 0;
					teams.forEach(el => {
						if (el.id == this.roster['id']) {
							this.teamMark = this.roster['team'].name + " " + this.teamMarkPipe.transform(i);
						}
						i++;
					})
				});
				this.server.get("list/player_at_roster", { 'filter': { 'roster_id': this.roster['id'] }, extend: true }).subscribe(val => {
					let players = [];
					val.forEach(el => {
						players.push(el.player);
					});
					this.players2roster = players;
					this.originPlayers2roster = this.players2roster.slice();
				});
			});
		}
	}
}
