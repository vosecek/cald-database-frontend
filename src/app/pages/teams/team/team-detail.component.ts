import { Component, OnInit } from '@angular/core';
import { Team } from '../../../types/team';
import { Player } from '../../../types/player';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TeamsService } from '../../../services/teams.service';
import { PlayerService } from '../../../services/player.service';
import { ServerService } from '../../../services/server.service';

import { LocalDataSource } from 'ng2-smart-table';
import { BirthDate } from './birthDate';


@Component({
	selector: 'team-detail',
	styleUrls: ['./team-detail.scss', '../../../theme/sass/smartTables.scss'],
	templateUrl: 'team-detail.component.html'
})

export class TeamDetailComponent implements OnInit {
	public team: Team;
	public players: Array<Player>;
	public form: Array<Player>;
	public loaded: boolean;

	public editable: boolean = false;
	public viewable: boolean = false;

	public settings: {};

	query: string = '';
	source: LocalDataSource = new LocalDataSource();

	constructor(
		private route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private teamsService: TeamsService,
		private playerService: PlayerService,
		private server: ServerService
	) {
		this.form = [];
		this.loaded = false;
	}

	public permission(): void {
		let access = this.server.permission(this.team.id);

		if (access == false) {
			this.editable = false;
			this.viewable = false;
		}

		if (access == 'edit' || access == 'admin') {
			this.editable = true;
			this.viewable = true;
		}

		if (access == 'view') {
			this.editable = false;
			this.viewable = true;
		}
	}

	initForm(): void {
		this.settings = {
			actions: {
				columnTitle: "Úprava",
				add: this.editable,
				edit: this.editable,
				delete: false
			},
			pager: {
				// perPage: 20
			},
			add: {
				confirmCreate: true,
				addButtonContent: '<i class="ion-ios-plus-outline"></i>',
				createButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			edit: {
				confirmSave: true,
				editButtonContent: '<i class="ion-edit"></i>',
				saveButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			noDataMessage: "Žádná data",
			columns: {
				id: {
					title: '#',
					type: 'number',
					editable: false,
					sort: false
				},
				first_name: {
					title: 'Jméno',
					type: 'string',
					editable: true
				},
				last_name: {
					title: 'Příjmení',
					type: 'string',
					editable: true
				},
				sex: {
					title: 'Pohlaví',
					type: 'html',
					editable: true,
					editor: {
						type: 'list',
						config: {
							list: [{ value: 'male', title: 'muž' }, { value: 'female', title: 'žena' }],
						},
					},
				},
				birth_date: {
					title: 'Datum narození',
					type: 'string',
					html5: 'date',
					editable: true
				},
				email: {
					title: 'E-mail',
					type: 'string',
					editable: true
				}
			}
		}
	}

	ngOnInit(): void {
		this.route.params.forEach((params: Params) => {
			let id = +params['id'];
			this.teamsService.getTeamPlayers(id).subscribe(players => {
				this.players = players;
				this.setForm();
			});
			this.team = this.teamsService.getTeam(id);
			this.permission();
			this.initForm();

		});
	}


	private setForm() {
		let data = [];
		this.players.forEach((f: any, i: any) => {
			if (f.player.birth_date) {
				let date = new Date(f.player.birth_date);
				if (!isNaN(date.getTime())) {
					f.player.birth_date = date.toISOString().substring(0, 10);
				}
			}

			data.push(f.player);
		});
		this.source.setSort([{ field: 'last_name', direction: 'asc' }]);
		this.source.load(data);
	}

	public editPlayer(data: any): void {
		data.confirm.resolve(data.newData);
		this.playerService.updatePlayer(data.newData);
	}

	public createPlayer(data: any): void {
		let player = data.newData;
		this.playerService.createPlayer(player).subscribe(val => {
			data.confirm.resolve(data.newData);
			player.id = val.id;
			this.playerService.assignPlayer2Team(player, this.team).subscribe(val => {
				// alert("Hráč vytvořen");
			});
		}, err => {
			console.log(err);
			alert(err);
		});
	}

}
