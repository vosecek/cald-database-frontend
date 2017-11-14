import { Component, OnInit, ViewChild } from '@angular/core';
import { Team } from '../../../types/team';
import { Player } from '../../../types/player';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { TeamsService } from '../../../services/teams.service';
import { PlayerService } from '../../../services/player.service';
import { ServerService } from '../../../services/server.service';

import { LocalDataSource } from 'ng2-smart-table';
import { BirthDate } from './birthDate';
import { ModalDirective } from 'ng2-bootstrap';
import { EmailValidator } from '../../../validators/validator';

import * as moment from 'moment';

@Component({
	selector: 'team-detail',
	styleUrls: ['./team-detail.scss', '../../../theme/sass/smartTables.scss'],
	templateUrl: 'team-detail.component.html'
})

export class TeamDetailComponent implements OnInit {
	@ViewChild('modal') modal: ModalDirective;

	public team: Team;
	public teams: Team[];
	public players: Array<Player>;
	public userForm: FormGroup;
	public loaded: boolean;
	public user: Player;
	protected access: string;
	duplicate: any[] = [];
	protected playerHistoryData: any[];

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
		protected server: ServerService
	) {
		this.loaded = false;
		this.teams = this.server.getType("team");
	}

	hideModal(): void {
		this.modal.hide();
	}

	pardonFee(): void {
		var canPardon = true;
		this.server.get(['player', this.userForm.value.id, "history"].join("/")).subscribe(val => {
			val.seasons.forEach(season => {
				if (parseInt(season.season.id) < parseInt(this.userForm.value.pardonFee) && season.tournaments.length > 0) canPardon = false;
			});

			if (canPardon) {
				this.server.post('admin/fee/pardon', { player_id: this.userForm.value.id, season_id: this.userForm.value.pardonFee }).subscribe(val => {
					alert('Poplatek odpuštěn');
					this.hideModal();
				}, err => {
					alert(err);
				});
			} else {
				alert('Hráč již hrál dříve, sezónní poplatek nelze odpustit');
			}
		}, err => {
			alert(err);
		});
	}

	revokePardonFee(): void {
		alert('Not implemented yet');
		this.hideModal();
		// this.server.delete('admin/fee/pardon', { player_id: this.userForm.value.id, season_id: this.userForm.value.pardonFee }).subscribe(val => {
		// 	console.log(val);
		// 	alert('Odpustek smazán');
		// 	this.hideModal();
		// }, err => {
		// 	alert(err);
		// });
	}

	public permission(): void {
		this.access = this.server.permission(this.team.id);

		if (!this.access) {
			this.editable = false;
			this.viewable = false;
		}

		if (this.access == 'edit' || this.access == 'admin') {
			this.editable = true;
			this.viewable = true;
		}

		if (this.access == 'view') {
			this.editable = false;
			this.viewable = true;
		}
	}

	public openUserForm(event, create?: boolean) {
		this.duplicate = [];
		this.playerHistoryData = null;
		this.userForm.reset();
		delete this.user;

		if (!create) {
			this.user = event.data;
			this.userForm.get("id").setValue(event.data.id);
			this.userForm.get("first_name").setValue(event.data.first_name);
			this.userForm.get("last_name").setValue(event.data.last_name);
			this.userForm.get("email").setValue(event.data.email);
			this.userForm.get("birth_date").setValue(moment(event.data.birth_date, 'DD/MM/YYYY').format("YYYY-MM-DD"));
			this.userForm.get("sex").setValue((event.data.sex == "muž" ? "male" : "female"));
			this.userForm.get("team").setValue(this.team.id);
			this.userForm.get("pardonFee").setValue(this.server.getType("season")[0].id);
		} else {
			this.userForm.get("team").setValue(this.team.id);
		}

		this.modal.show();
	}

	public validateDuplicate(): void {
		this.duplicate = [];

		let players = this.server.getType("player");
		if (this.userForm.value.first_name == null || this.userForm.value.last_name == null) return;
		players.forEach(item => {
			if (item.id == this.userForm.value.id) return;
			if ((item.first_name && item.first_name.toLowerCase().search(this.userForm.value.first_name.toLowerCase()) > -1) && (item.last_name && item.last_name.toLowerCase().search(this.userForm.value.last_name.toLowerCase()) > -1)) {
				this.duplicate.push(item);
			}
		});
	}

	public saveUser(): void {
		if (!this.userForm.value.id) {
			this.playerService.createPlayer(this.userForm.value).subscribe(val => {
				this.userForm.value.id = val.id;
				this.playerService.assignPlayer2Team(this.userForm.value, this.userForm.value.team).subscribe(val => {
					this.source.prepend(this.userForm.value);
				});
				this.server.reload("player").then(() => {

				});
				this.server.reload("player_at_team").then(() => {

				});
			}, err => {
				alert(err);
			});
			this.hideModal();
		} else {
			if (this.team.id != this.userForm.controls['team'].value) {
				this.playerService.deletePlayer2Team(this.userForm.value, this.team.id).subscribe(val => {
					this.playerService.assignPlayer2Team(this.userForm.value, this.userForm.value.team).subscribe(val => {
						this.server.reload("player_at_team").then(() => {

						});
						let result = this.server.getType('team', this.userForm.value.team);
						alert("Hráč přesunut do týmu " + result.name);
						this.source.remove(this.user);
					});
				});
			}
			this.source.update(this.user, this.userForm.value);
			this.playerService.updatePlayer(this.userForm.value);
			this.hideModal();
		}
	}

	initForm(): void {
		this.userForm = this.formBuilder.group({
			'id': [''],
			'first_name': ['', Validators.required],
			'last_name': ['', Validators.required],
			'email': ['', [EmailValidator]],
			'birth_date': [''],
			'sex': ['', Validators.required],
			'team': [{ value: this.team.id }],
			'pardonFee': ['']
		});

		this.settings = {
			mode: "external",
			actions: {
				columnTitle: "Úprava",
				add: this.editable,
				edit: this.editable,
				delete: false
			},
			pager: {
				perPage: 50
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
					sort: false
				},
				first_name: {
					title: 'Jméno',
					type: 'string'
				},
				last_name: {
					title: 'Příjmení',
					type: 'string'
				},
				sex: {
					title: 'Pohlaví',
					type: 'string'
				},
				birth_date: {
					title: 'Datum narození',
					type: 'string',
				},
				email: {
					title: 'E-mail',
					type: 'string'
				}
			}
		}

		if (!this.editable) {
			delete this.settings['columns']['birth_date'];
		}
	}

	playerHistory(): void {
		this.server.get('player/' + this.userForm.value.id + '/history').subscribe(val => {
			this.playerHistoryData = val;
			this.playerHistoryData.forEach(el => {
				el.seasons.forEach(s => {
					s.show = false;
				});
			});
		});
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
					f.player.birth_date = moment(date).format('DD/MM/YYYY');
				}
			}

			if (f.player.sex == "male") f.player.sex = "muž";
			if (f.player.sex == "female") f.player.sex = "žena";

			if (!data.find(it => it.id == f.player.id)) {
				data.push(f.player);
			}
		});
		this.source.setSort([{ field: 'last_name', direction: 'asc' }]);
		this.source.load(data);
	}
}
