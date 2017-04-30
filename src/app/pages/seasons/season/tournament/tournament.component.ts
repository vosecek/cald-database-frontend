import { Component, OnInit } from '@angular/core';
import { Season } from '../../../../types/season';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../../../services/server.service';

import { TournamentExtended } from '../../../../types/tournamentextended';
import { Tournament } from '../../../../types/tournament';
import { Player } from '../../../../types/player';

import { PlayerPipe } from '../../../../pipes/player.pipe';
import { OrderBy } from '../../../../pipes/order.pipe';

declare var pdfMake: any;


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
	pdfInProcess: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		public server: ServerService,
		private playerPipe: PlayerPipe,
		private order: OrderBy
	) {
		this.season = new Season;
		this.tournament = new Tournament;
	}

	private addPdfRosterPage(team) {
		let tournament_roster = [];
		let division_header = [];

		var date = new Date();

		this.divisions.forEach(div => {
			let division_name = this.server.getType("division", div.division_id, 'name');
			var userRosters = div['rosters'].filter(item => item.team_id == team);
			userRosters.forEach(el => {
				division_header.push({ text: division_name + "" + (el.mark > 0 ? el.mark : ""), bold: true });
				el.code = division_name + "" + (el.mark > 0 ? el.mark : "");
				tournament_roster.push(el);
			});
		});

		let table_body = [];
		let table_width = [];
		var table_header = division_header;

		var i = 0;
		while (division_header.length > i) {
			i++;
			table_width.push(45);
		}
		table_header.unshift({ text: "Jméno hráče", bold: true });
		table_width.unshift("auto");
		table_header.push({ text: "Narozen", bold: true });
		table_width.push("auto");

		var players = [];
		var players_data = [];
		var inserted = {};

		tournament_roster.forEach(el => {
			el.players.forEach((player) => {
				if (!inserted[player.player_id]) {
					inserted[player.player_id] = true;
					player.birth_date = this.server.getType("player", player.player_id, "birth_date");
					players_data.push(player);
				}
			})
		});

		players_data = this.order.transform(players_data, ["name"]);

		players_data.forEach((player) => {
			player.rosters = [];
			tournament_roster.forEach(roster => {
				let isInRoster = roster.players.find(item => item.player_id == player['player_id']);
				if (isInRoster) {
					player.rosters.push({ text: "X", style: 'textCenter' });
				} else {
					player.rosters.push("");
				}
			});
		});

		table_body.push(table_header);

		players_data.forEach(player => {
			let row = [];
			row.push(player.name);
			row = row.concat(player.rosters);
			if (player.birth_date) {
				let date = new Date(player.birth_date.split(" ")[0]);
				if (!isNaN(date.getTime())) {
					player.birth_date = date.toISOString().substring(0, 10);
				} else {
					player.birth_date = "?";
				}
			}else{
				player.birth_date = "?";
			}

			row.push(player.birth_date);
			table_body.push(row);
		});

		var rosterPdf = [{ text: 'Česká asociace létajícího disku', style: 'pageHeader' },
		{ text: 'Týmová soupiska', style: 'header' },
		{ text: "Název oddílu: " + this.server.getType("team", team.toString(), "name"), bold: true, style: "list" },
		{ text: "Turnaj: " + this.tournament.name + " (" + this.tournament['date'].toLocaleDateString() + ")", style: "list" },
		{ text: "Vytisknuto: " + date.toLocaleDateString(), style: "list" },
		{ text: "Hráči na soupisce", style: "subHeader" },
		{
			table: {
				headerRows: 1,
				widths: table_width,

				body: table_body
			}
		}];

		return rosterPdf;
	}

	public pdf(team?: number): void {
		this.pdfInProcess = true;
		var pdfContent = [];

		if (team) {
			pdfContent.push(this.addPdfRosterPage(team));
		} else {
			let team2pdf = [];
			this.divisions.forEach(el => {
				el.rosters.forEach(el => {
					if (team2pdf.indexOf(el.team_id) < 0) {
						team2pdf.push(el.team_id);
					}
				});
			});

			var i = 0;
			team2pdf.forEach(team => {
				i++;
				var page = this.addPdfRosterPage(team);
				if (i > 1) page[0]['pageBreak'] = 'before';
				pdfContent.push(page);
			});
		}

		var docDefinition = {
			content: pdfContent,
			styles: {
				list: {
					margin: [0, 5]
				},
				header: {
					fontSize: 22,
					bold: true,
					alignment: 'center',
					margin: [0, 20]
				},
				subHeader: {
					fontSize: 14,
					bold: true,
					margin: [0, 20, 0, 5]
				},
				pageHeader: {
					fontSize: 18,
					alignment: 'left'
				},
				textCenter: {
					alignment: 'center'
				}
			}
		};

		pdfMake.createPdf(docDefinition).download('roster.pdf');
		this.pdfInProcess = false;
	}

	public roster(r: any, id?: number): void {
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

	public futureTournament(): boolean {
		return (this.tournament['date'] > new Date());
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
