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

@Component({
	selector: 'team-detail',
	styleUrls: ['./team-detail.scss', '../../../theme/sass/smartTables.scss'],
	templateUrl: 'team-detail.component.html'
})

export class TeamDetailComponent implements OnInit {
	@ViewChild('modal') modal: ModalDirective;

	public team: Team;
	public players: Array<Player>;
	public userForm: FormGroup;
	public loaded: boolean;
	public user: Player;

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
		this.loaded = false;
	}

	hideModal(): void {
		this.modal.hide();
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

	public openUserForm(event, create?: boolean) {
		this.userForm.reset();

		delete this.user;

		if (!create) {
			this.user = event.data;
			this.userForm.get("id").setValue(event.data.id);
			this.userForm.get("first_name").setValue(event.data.first_name);
			this.userForm.get("last_name").setValue(event.data.last_name);
			this.userForm.get("email").setValue(event.data.email);
			this.userForm.get("birth_date").setValue(event.data.birth_date);
			this.userForm.get("sex").setValue(event.data.sex);
		}

		this.modal.show();
	}

	public saveUser(): void {
		if (!this.userForm.value.id) {
			this.playerService.createPlayer(this.userForm.value).subscribe(val => {
				this.userForm.value.id = val.id;
				this.playerService.assignPlayer2Team(this.userForm.value, this.team).subscribe(val => {
					this.source.prepend(this.userForm.value);
				});
			}, err => {
				alert(err);
			});
			this.hideModal();
		} else {
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
			// 'teams': [''] 
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
				perPage: 30
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
					html5: 'date'
				},
				email: {
					title: 'E-mail',
					type: 'string'
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
}
