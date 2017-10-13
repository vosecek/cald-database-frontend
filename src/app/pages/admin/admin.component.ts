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
import { TeamCell } from './teamCell';


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

	public inEdit: any;

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
		private fb: FormBuilder
	) {
	}

	hideModal(): void {
		this.modal.hide();
	}

	public deleteTournament($data, $source): void {
		let ok = confirm("Opravdu smazat turnaj " + $data.data.name + "?");
		if (ok) {
			this.server.delete("admin/tournament/" + $data.data.id).subscribe(val => {
				this.source.tournament.remove($data.data).then(val => {
				});
			});
		}
	}

	public saveTournament(): void {
		let path = ["admin", "tournament"];
		if (this.tournamentForm.value.id) {
			path.push(this.tournamentForm.value.id);
			this.server.put(path.join("/"), this.tournamentForm.value).subscribe(val => {
				this.source.tournament.update(this.inEdit, this.tournamentForm.value);
				this.server.reload("tournamentExtendedFull").then(data => {
					this.tournament();
				});
				this.hideModal();
			});
		} else {
			this.server.post(path.join("/"), this.tournamentForm.value).subscribe(val => {
				this.source.tournament.prepend(this.tournamentForm.value);
				this.server.reload("tournamentExtendedFull").then(data => {
					this.tournament();
				});
				this.hideModal();
			});
		}
	}

	public saveTeam(): void {
		let path = ["team"];

		if (this.teamForm.value.id) {
			path.push(this.teamForm.value.id);
			this.source.team.update(this.inEdit, this.teamForm.value);
		} else {
			this.source.team.prepend(this.teamForm.value);
		}
		this.server.post(path.join("/"), this.teamForm.value).subscribe(val => {
			this.hideModal();
		});
	}

	public saveUser(): void {
		if (!this.userForm.value.id) {
			this.server.post('user', this.userForm.value).subscribe(val => {
				this.server.put("admin/user/" + val.id, { state: "confirmed" }).subscribe(el => {
					console.log(el);
				}, err => {
					console.log(err);
				});
				this.userForm.value.privileges.forEach(el => {
					this.server.post("team/" + el + "/user/" + val.id, { "privilege": "edit" }).subscribe(el => {
					});
				});
				this.convertPrivileges(this.userForm.value);
				this.source.user.prepend(this.userForm.value);
				this.hideModal();
			});
		} else {
			let toDelete = this.originalPrivileges.filter(item => this.userForm.value.privileges.indexOf(item) < 0);
			let toAdd = this.userForm.value.privileges.filter(item => this.originalPrivileges.indexOf(item) < 0);

			this.server.put('admin/user/' + this.userForm.value.id, this.userForm.value).subscribe(val => {
				toDelete.forEach(el => {
					this.server.delete("team/" + el + "/user/" + this.userForm.value.id, { "privilege": "edit" }).subscribe(el => {
					});
				});

				toAdd.forEach(el => {
					this.server.post("team/" + el + "/user/" + this.userForm.value.id, { "privilege": "edit" }).subscribe(el => {
					});
				});

				this.convertPrivileges(this.userForm.value);
				this.source.user.update(this.inEdit, this.userForm.value);
				this.hideModal();
			});
		}
	}

	public openTournamentForm(event, create?: boolean): void {
		this.tournamentForm.reset();
		delete this.inEdit;

		if (event.data) {
			this.inEdit = event.data;

			let record = this.server.getType("tournament", event.data.id)
			if (!create && record) {
				var extended = this.server.getType("tournamentExtended", record.id, null, 'tournament_id', true);
				let leagues = [];
				let divisions = [];
				extended.forEach(el => {
					divisions.push(el.division_id);
					leagues.push(el.league_id);
				});

				this.tournamentForm.get("id").setValue(record.id);
				this.tournamentForm.get("name").setValue(record.name);
				this.tournamentForm.get("date").setValue(record.date);
				this.tournamentForm.get("location").setValue(record.location);
				this.tournamentForm.get("season_id").setValue(record.season_id);
				this.tournamentForm.get("league_ids").setValue(leagues);
				this.tournamentForm.get("division_ids").setValue(divisions);
			}
			this.modal.show();
		} else {
			this.modal.show();
		}
	}

	public openTeamForm(event, create?: boolean): void {
		this.teamForm.reset();

		if (!create) {
			this.inEdit = event.data;
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
			this.inEdit = event.data;
			event.data.privileges.forEach(el => {
				if (typeof el == "object") {
					this.originalPrivileges.push(el['entity_id']);
				} else {
					this.originalPrivileges.push(el);
				}
			});
			this.userForm.get("privileges").setValue(this.originalPrivileges);

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
				perPage: 10
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
				privileges_string: {
					title: 'oddíly',
					type: 'custom',
					renderComponent: TeamCell
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

	private convertPrivileges(val: any): any[] {
		var data = [];
		val.privileges_string = "";
		val.privileges.forEach(x => {
			if (typeof x == "object" && x.entity_id) {
				data.push(x.entity_id);
			} else {
				data.push(x);
			}
		});
		val.privileges_string = data.join(",");
		return val;
	}

	public fee(): void {
		let seasons = this.server.getType("season");
		this.server.get("admin/fee", { season_id: seasons[seasons.length - 1].id }).subscribe(val => {
			console.log(val);
		}, err => {
			console.log(err);
		});

		this.type = "fee";
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
				el = this.convertPrivileges(el);
			});
			this.source.user.load(val);
		});

		this.userForm = this.fb.group({
			'id': [''],
			'password': [''],
			'email': ['', [EmailValidator, Validators.required]],
			'login': ['', Validators.required],
			'privileges': ['']
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
