import { Component, ViewChild } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../services/server.service';
import { SeasonsService } from '../../services/seasons.service';
import { TeamsService } from '../../services/teams.service';

import { Season } from '../../types/season';
import { Tournament } from '../../types/tournament';
import { User } from '../user/user';

import { EmailValidator } from '../../validators/validator';
import { LocalDataSource } from 'ng2-smart-table';

import { Privileges } from './privileges';
import { ModalDirective } from 'ng2-bootstrap';
import { DateCell } from './dateCell';


@Component({
	selector: 'admin',
	styleUrls: ['./admin.scss', '../../theme/sass/smartTables.scss'],
	templateUrl: './admin.html'
})
export class Admin {
	@ViewChild('modal') modal: ModalDirective;

	public tournamentForm: FormGroup;
	public teamForm: FormGroup;
	public userForm: FormGroup;
	public users: Array<User>;

	private seasons: Array<Season>;
	public type: string = "";

	private originalPrivileges: Array<any> = [];

	private teamsOptions: Array<{ value: string, title: string }> = [];

	userQuery: string = '';
	source: { 'user', 'team', 'tournament' } = { 'user': LocalDataSource, 'team': LocalDataSource, 'tournament': LocalDataSource };
	settings: { 'user', 'team', 'tournament' } = { 'user': {}, 'team': {}, 'tournament': {} };

	constructor(
		private server: ServerService,
		private teams: TeamsService,
		private formBuilder: FormBuilder,
		private fb: FormBuilder
	) {
	}

	hideModal(): void {
		this.modal.hide();
	}

	public deleteTournament($data, $source): void {
		console.log($data.data);
		let ok = confirm("Opravdu smazat turnaj " + $data.data.name + "?");
		if (ok) {
			this.server.delete("admin/tournament/" + $data.data.id).subscribe(val => {
				this.source.tournament.remove($data.data).then(val => {
					console.log(val);
				});
			});
		}
	}

	public saveTournament(): void {
		let path = ["admin", "tournament"];
		if (this.tournamentForm.value.id) {
			path.push(this.tournamentForm.value.id);
			this.server.put(path.join("/"), this.tournamentForm.value).subscribe(val => {
				console.log(val);
				this.server.reload("tournamentExtendedFull").then(data => {
					this.tournament();
				});
				this.hideModal();
			});
		} else {
			this.server.post(path.join("/"), this.tournamentForm.value).subscribe(val => {
				console.log(val);
				this.server.reload("tournamentExtendedFull").then(data => {
					this.tournament();
				});
				this.hideModal();
			});
		}



	}

	public saveTeam(): void {
		let path = ["team"];
		if (this.teamForm.value.id) path.push(this.teamForm.value.id);
		this.server.post(path.join("/"), this.teamForm.value).subscribe(val => {
			this.hideModal();
			this.server.reload("team").then(val => {
				this.source.team.load(val);
			});
		});
	}

	public saveUser(): void {
		if (!this.userForm.value.id) {
			this.server.post('user', this.userForm.value).subscribe(val => {
				this.userForm.value.teams.forEach(el => {
					this.server.post("team/" + el + "/user/" + this.userForm.value.id).subscribe(el => {
					});
				});
				this.hideModal();
			});
		} else {
			let toDelete = this.originalPrivileges.filter(item => this.userForm.value.teams.indexOf(item) < 0);
			let toAdd = this.userForm.value.teams.filter(item => this.originalPrivileges.indexOf(item) < 0);

			this.server.put('admin/user/' + this.userForm.value.id, this.userForm.value).subscribe(val => {
				toDelete.forEach(el => {
					this.server.delete("team/" + el + "/user/" + this.userForm.value.id, { "privilege": "edit" }).subscribe(el => {
					});
				});

				toAdd.forEach(el => {
					this.server.post("team/" + el + "/user/" + this.userForm.value.id, { "privilege": "edit" }).subscribe(el => {
					});
				});
				this.hideModal();
			});
		}
	}

	public openTournamentForm(event, create?: boolean): void {
		this.tournamentForm.reset();

		if (event.data) {
			this.server.reload('tournamentExtendedFull').then(data => {
				let record = data.filter(item => item.tournament.id == event.data.id);
				if (!create && record[0]) {
					let season = this.seasons.filter(item => item.name == record[0].tournament.season);
					this.tournamentForm.get("id").setValue(record[0].tournament.id);
					this.tournamentForm.get("name").setValue(record[0].tournament.name);
					this.tournamentForm.get("date").setValue(record[0].tournament.date);
					this.tournamentForm.get("location").setValue(record[0].tournament.location);
					this.tournamentForm.get("season_id").setValue(season[0].id);
					this.tournamentForm.get("league_ids").setValue([record[0].league.id]);
					this.tournamentForm.get("division_ids").setValue([record[0].division.id]);
				}
				this.modal.show();
			});
		} else {
			this.modal.show();
		}
	}

	public openTeamForm(event, create?: boolean): void {
		this.teamForm.reset();

		if (!create) {
			this.teamForm.get("id").setValue(event.data.id);
			this.teamForm.get("name").setValue(event.data.name);
			this.teamForm.get("founded_at").setValue(event.data.founded_at);
			this.teamForm.get("city").setValue(event.data.city);
			this.teamForm.get("www").setValue(event.data.www);
		}
		this.modal.show();
	}

	public openUserForm(event, create?: boolean) {
		this.userForm.reset();

		this.originalPrivileges = [];

		if (!create) {
			event.data.privileges.forEach(el => {
				this.originalPrivileges.push(el['entity_id']);
			});

			this.userForm.get("teams").setValue(this.originalPrivileges);

			this.userForm.get("id").setValue(event.data.id);
			this.userForm.get("login").setValue(event.data.login);
			this.userForm.get("email").setValue(event.data.email);
			this.userForm.removeControl('password');
			this.userForm.setControl("password", new FormControl("", []));
		} else {
			this.userForm.removeControl('password');
			this.userForm.setControl("password", new FormControl("", [Validators.required, Validators.minLength(6)]));
		}

		this.modal.show();
	}

	private initSettings() {
		this.settings.user = {
			mode: "external",
			actions: {
				columnTitle: "Úprava",
				add: true,
				edit: true,
				delete: false
			},
			pager: {
				perPage: 20
			},
			add: {
				addButtonContent: '<i class="ion-ios-plus-outline"></i>',
				createButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			edit: {
				editButtonContent: '<i class="ion-edit"></i>',
				saveButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			columns: {
				login: {
					title: 'login',
					type: 'string'
				},
				email: {
					title: 'e-mail',
					type: 'string'
				},
				teams: {
					title: 'oddíly',
					type: 'string'
				}
			}
		};

		this.settings.tournament = {
			mode: "external",
			actions: {
				columnTitle: "Úprava",
				add: true,
				edit: true,
				delete: true
			},
			pager: {
				perPage: 20
			},
			add: {
				addButtonContent: '<i class="ion-ios-plus-outline"></i>',
				createButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			edit: {
				editButtonContent: '<i class="ion-edit"></i>',
				saveButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			delete: {
				deleteButtonContent: '<i class="ion-trash-a"></i>',
				confirmDelete: true
			},
			columns: {
				name: {
					title: 'Název',
					type: 'string'
				},
				location: {
					title: 'Místo konání',
					type: 'string'
				},
				date: {
					title: 'Datum',
					type: 'string'
				},
				league: {
					title: 'Liga',
					type: 'string'
				},
				division: {
					title: 'Divize',
					type: 'string'
				},
				season: {
					title: 'Sezona',
					type: 'string'
				}
			}
		};

		this.settings.team = {
			mode: "external",
			actions: {
				columnTitle: "Úprava",
				add: true,
				edit: true,
				delete: false
			},
			pager: {
				perPage: 20
			},
			add: {
				addButtonContent: '<i class="ion-ios-plus-outline"></i>',
				createButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			edit: {
				editButtonContent: '<i class="ion-edit"></i>',
				saveButtonContent: '<i class="ion-checkmark"></i>',
				cancelButtonContent: '<i class="ion-close"></i>',
			},
			columns: {
				name: {
					title: 'Název',
					type: 'string'
				},
				city: {
					title: 'Město',
					type: 'string'
				},
				www: {
					title: 'Web',
					type: 'string'
				},
				email: {
					title: 'E-mail',
					type: 'string'
				},
				founded_at: {
					title: 'Založeno',
					type: 'custom',
					renderComponent: DateCell
				}
			}
		};
	}

	public user(): void {
		this.teamsOptions = [];
		this.server.getType("team").forEach(el => {
			this.teamsOptions.push({ value: el.id, title: el.name });
		});
		this.source.user = new LocalDataSource();
		this.source.user.setSort([{ field: 'teams', direction: 'asc' }]);
		this.server.get("list/user", { 'extend': true }).subscribe(val => {
			val.forEach(el => {
				if (!el.teams) el.teams = '';
				var teams = [];
				el['privileges'].forEach(el2 => {
					if (!el2['entity_id']) return;
					let team = this.teams.getTeam(el2['entity_id']);
					if (team) {
						teams.push(team['name']);
					}
				});
				el.teams = teams.join(', ');
			});
			this.source.user.load(val);
		});

		this.userForm = this.fb.group({
			'id': [''],
			'password': [''],
			'email': ['', [EmailValidator, Validators.required]],
			'login': ['', Validators.required],
			'teams': ['']
		});
		this.type = "user";
	}

	public team(): void {
		this.source.team = new LocalDataSource();
		this.source.team.setSort([{ field: 'name', direction: 'asc' }]);
		this.source.team.load(this.server.getType("team"));
		this.teamForm = this.fb.group({
			'id': [''],
			'name': ['', Validators.required],
			'founded_at': [''],
			'city': [''],
			'www': [''],
			'email': ['', EmailValidator]
		});
		this.type = "team";
	}

	public tournament(create?: boolean): void {
		this.source.tournament = new LocalDataSource();
		this.source.tournament.setSort([{ field: 'date', direction: 'desc' }]);

		let data = [];
		console.log(this.server.get("list/tournament"));
		this.server.get("list/tournament").subscribe(val => {
			val.forEach((el: Tournament) => {
				var extended = this.server.getType("tournamentExtended", el.id, null, 'tournament_id', true);
				el['league'] = [];
				el['division'] = [];

				extended.forEach(ex => {
					el['league'] = this.server.getType("league", ex['league_id'], "name");
					el['division'].push(this.server.getType("division", ex['division_id'], "name"));
				});

				el['division'] = el['division'].join(", ");
				el['season'] = this.server.getType("season", el['season_id'], "name");
				// el['date'] = new Date(el['date'].split(" ")[0]);
				el['date'] = el['date'].split(" ")[0];
				data.push(el);
			});
			this.source.tournament.load(data);
		});

		this.tournamentForm = this.fb.group({
			'id': [''],
			'name': ['Test', Validators.required],
			'date': ['', Validators.required],
			'location': ['Lokace'],
			'duration': ['2'],
			'league_ids': ['', Validators.required],
			'season_id': [''],
			'division_ids': ['', Validators.required]
		});

		this.type = "tournament";
	}

	ngOnInit(): void {
		this.seasons = this.server.getType("season");
		this.initSettings();
		this.tournament();
	}

}
