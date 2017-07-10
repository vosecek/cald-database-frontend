import { Component, OnInit } from '@angular/core';
import { Season } from '../../../../../types/season';
import { Player } from '../../../../../types/player';
import { Team } from '../../../../../types/team';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../../../../services/server.service';

import { PlayerPipe } from '../../../../../pipes/player.pipe';
import { TeamMarkPipe } from '../../../../../pipes/team-mark.pipe';

import { AlertComponent } from 'ng2-bootstrap';

@Component({
	selector: 'roster',
	styleUrls: ['./roster.scss'],
	providers: [PlayerPipe],
	templateUrl: 'roster.html',
})

export class RosterComponent {

	private id: number;
	roster: any[];
	teams: Team[];

	tournament: {};
	tournament_id: string;

	selectedTeam: number;
	updated: boolean = false;

	sending: boolean = false;
	alerts: any[] = [];

	public players2roster: Player[] = [];
	public availablePlayers: Player[] = [];
	public usedPlayers: any[];

	public teamMark: string = "";

	queryTeam: string = "";
	queryPlayer: string = "";
	foundPlayers: Player[] = [];

	public allowOpen: boolean = true;

	private originPlayers2roster: Player[] = [];

	constructor(
		private route: ActivatedRoute,
		private server: ServerService,
		private playerPipe: PlayerPipe,
		private teamMarkPipe: TeamMarkPipe,
		private router: Router
	) {
	}

	protected teamDetail(): void {
		this.save(true);
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

	private updateFinished(detail): void {
		this.sending = false;
		this.updated = true;
		this.originPlayers2roster = this.players2roster.slice();

		if (detail) {
			this.router.navigate(['app', 'teams', this.selectedTeam]);
		}
	}

	save(detail?: boolean): void {
		this.sending = true;
		this.updated = false;
		let toAdd = this.players2roster.filter(item => this.originPlayers2roster.indexOf(item) < 0);
		let toDelete = this.originPlayers2roster.filter(item => this.players2roster.indexOf(item) < 0);

		let finished = 0;
		if (toAdd.length + toDelete.length === 0) {
			this.updateFinished(detail);
		}

		toAdd.forEach(item => {
			this.server.post(["roster", this.id, "player", item.id].join("/")).subscribe(el => {
			}, err => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished(detail);
				}
			}, () => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished(detail);
				}
			});
		});

		toDelete.forEach(item => {
			this.server.delete(["roster", this.id, "player", item.id].join("/")).subscribe(el => {
			}, err => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished(detail);
				}
			}, () => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished(detail);
				}
			});
		});
	}

	delete(): void {
		this.sending = true;
		let ok = confirm("Opravdu smazat soupisku týmu " + this.teamMark + "?");
		if (ok) {
			this.server.delete('roster/' + this.id).subscribe(val => {
				this.router.navigateByUrl(this.tournamentUrl());
				this.sending = false;
			}, err => {
				this.sending = false;
			});
		} else {
			this.sending = false;
		}
	}

	inRoster(p: Player): boolean {
		if (this.players2roster.find(item => p.id == item.id)) {
			return true;
		} else {
			return false;
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
			this.tournament_id = params['division'];
		});

		this.tournament = this.server.getType("tournamentExtended", this.tournament_id);
		this.tournament['division'] = this.server.getType('division', this.tournament['division_id']);

		if (this.tournament['division'].cond) {
			let condition = JSON.parse(this.tournament['division'].cond);
			if (condition.player && condition.player.fields && condition.player.fields.sex) {
				if (condition.player.fields.sex == "female") {
					this.allowOpen = false;
				}
			}
		}

		if (this.id) {
			this.server.get("list/roster", { 'extend': true, 'filter': { 'id': this.id } }).subscribe(val => {
				if (val.length == 0) {
					this.router.navigateByUrl(this.tournamentUrl());
				}
				this.roster = val[0];
				this.selectedTeam = this.roster['team'].id;
				this.loadTeam();
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
