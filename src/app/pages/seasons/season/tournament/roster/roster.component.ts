import { Component, OnInit } from '@angular/core';
import { Season } from '../../../../../types/season';
import { Player } from '../../../../../types/player';
import { Team } from '../../../../../types/team';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../../../../services/server.service';

import jsPDF from 'jspdf'

// import { TournamentExtended } from '../../../../types/tournamentextended';
// import { Tournament } from '../../../../types/tournament';

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

	public pdf(): void {
		var doc = new jsPDF();
		doc.text(20, 20, 'Hello world!');
		doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
		doc.addPage();
		doc.text(20, 20, 'Do you like that?');

		// Save the PDF
		doc.save('Test.pdf');
	}

	public searchPlayer(): void {
		if (this.queryPlayer.length > 2) {
			let players = this.server.getType("player");
			this.queryPlayer = this.queryPlayer.toLowerCase();
			this.foundPlayers = players.filter(item => {
				if ((item.first_name && item.first_name.toLowerCase().search(this.queryPlayer) > -1) || (item.last_name && item.last_name.toLowerCase().search(this.queryPlayer) > -1)) {
					return true;
				}
			});
		}
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

	private updateFinished(): void {
		this.sending = false;
		this.updated = true;
		this.originPlayers2roster = this.players2roster.slice();
	}

	save(): void {
		this.sending = true;
		this.updated = false;
		let toAdd = this.players2roster.filter(item => this.originPlayers2roster.indexOf(item) < 0);
		let toDelete = this.originPlayers2roster.filter(item => this.players2roster.indexOf(item) < 0);

		let finished = 0;
		if (toAdd.length + toDelete.length === 0) {
			this.updateFinished();
		}

		toAdd.forEach(item => {
			this.server.post(["roster", this.id, "player", item.id].join("/")).subscribe(el => {
				console.log(el);
			}, err => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished();
				}
			}, () => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished();
				}
			});
		});

		toDelete.forEach(item => {
			this.server.delete(["roster", this.id, "player", item.id].join("/")).subscribe(el => {
				console.log(el);
			}, err => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished();
				}
			}, () => {
				finished++;
				if (finished == (toAdd.length + toDelete.length)) {
					this.updateFinished();
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
