import { Component, ViewChild } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../services/server.service';
import { SeasonsService } from '../../services/seasons.service';
import { TeamsService } from '../../services/teams.service';

import { Season } from '../../types/season';
import { PlayerAtTeam } from '../../pipes/player_at_team.pipe';
import { Player } from '../../types/player';
import { Tournament } from '../../types/tournament';
import { User } from '../user/user';

import { EmailValidator } from '../../validators/validator';
import { LocalDataSource } from 'ng2-smart-table';

import { Privileges } from './privileges';
import { ModalDirective } from 'ng2-bootstrap';
import { DateCell } from './dateCell';
import { TeamCell } from './teamCell';

import { Angular2Csv } from 'angular2-csv/Angular2-csv';


@Component({
    selector: 'admin',
    styleUrls: ['./admin.scss', '../../theme/sass/smartTables.scss'],
    templateUrl: './admin.html'
})
export class Admin {
    @ViewChild('modal') modal: ModalDirective;

    protected exportForm: FormGroup;

    public nationalityForm: FormGroup;
    public tournamentForm: FormGroup;
    public teamForm: FormGroup;
    public userForm: FormGroup;
    public users: Array<User>;
    protected sending: boolean = false;

    public inEdit: any;

    protected seasons: Array<Season>;
    public type: string = "";

    private originalPrivileges: Array<any> = [];

    private teamsOptions: Array<{ value: string, title: string }> = [];

    userQuery: string = '';
    source: { 'user', 'team', 'tournament', 'nationality' } = {
        'user': LocalDataSource,
        'team': LocalDataSource,
        'tournament': LocalDataSource,
        'nationality': LocalDataSource,
    };
    settings: { 'user', 'team', 'tournament', 'nationality' } = {
        'user': {},
        'team': {},
        'tournament': {},
        'nationality': {}
    };

    constructor(
        private server: ServerService,
        private teams: TeamsService,
        private fb: FormBuilder,
        private playerAtTeam: PlayerAtTeam
    ) {
    }

    hideModal(): void {
        this.modal.hide();
    }

    public deleteNationality($data): void {
        console.log($data);
    }

    public openNationalityForm(data): void {

        data = data || null;
        this.nationalityForm.reset();

        if (data.data) {
            this.nationalityForm.controls['id'].patchValue(data.data.id);
            this.nationalityForm.controls['name'].patchValue(data.data.name);
            this.nationalityForm.controls['country_name'].patchValue(data.data.country_name);
        }

        this.modal.show();
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

    public saveNationality(): void {
        let path = ["admin", "nationality"];

        if (this.nationalityForm.value.id) {
            path.push(this.nationalityForm.value.id);
            this.source.nationality.update(this.inEdit, this.nationalityForm.value);
            this.server.put(path.join("/"), this.nationalityForm.value).subscribe(val => {
                this.hideModal();
            });
        } else {
            this.source.nationality.prepend(this.nationalityForm.value);
            this.server.post(path.join("/"), this.nationalityForm.value).subscribe(val => {
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
                this.server.put("admin/user/" + val.id, {state: "confirmed"}).subscribe(el => {
                    console.log(el);
                }, err => {
                    console.log(err);
                });
                this.userForm.value.privileges.forEach(el => {
                    this.server.post("team/" + el + "/user/" + val.id, {"privilege": "edit"}).subscribe(el => {
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
                    this.server.delete("team/" + el + "/user/" + this.userForm.value.id, {"privilege": "edit"}).subscribe(el => {
                    });
                });

                toAdd.forEach(el => {
                    this.server.post("team/" + el + "/user/" + this.userForm.value.id, {"privilege": "edit"}).subscribe(el => {
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

            let record = this.server.getType("tournament", event.data.id);
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

        this.settings.nationality = {
            mode: 'external',
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
            actions: {
                columnTitle: "Úprava",
                add: true,
                edit: true,
                delete: false
            },
            pager: {
                perPage: 20
            },
            columns: {
                name: {
                    title: 'Název',
                    type: 'string'
                },
                country_name: {
                    title: 'Stát',
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


    public exportByFilter(): void {
        this.sending = true;
        let cond = this.exportForm.value;
        let found = this.server.getType("player").filter((pl: Player) => {
            if (cond.sex) {
                if (pl.sex != cond.sex) return false;
            }

            let ok = false;
            if (cond.birth_date && pl.birth_date) {
                let year = parseInt(pl.birth_date.split("-")[0]);
                switch (cond.birth_date_comparator) {
                    case "<=":
                        ok = year <= cond.birth_date;
                        break;
                    case ">=":
                        ok = year >= cond.birth_date;
                        break;
                    case "==":
                        ok = cond.birth_date == year;
                        break;
                    case ">":
                        ok = year > cond.birth_date;
                        break;
                    case "<":
                        ok = year < cond.birth_date;
                        break;
                }
            } else {
                return true;
            }
            return ok;
        });

        let promises = [];
        let player_history = {};
        let toAdd = [];

        if (this.exportForm.value.active_in_seasons_allowed) {
            found.forEach((el: Player) => {
                promises.push(new Promise((resolve, reject) => {
                    this.server.get(['player', el.id, "history"].join("/")).subscribe(val => {
                        let notActive = false;
                        this.exportForm.value.active_in_seasons.forEach(s => {
                            let season = val.seasons.find(ses => {
                                return (ses.season.id == s);
                            });
                            if (season) {
                                if (season.tournaments.length == 0) {
                                    notActive = true;
                                }
                            } else {
                                notActive = true;
                            }
                        });
                        if (notActive == false) {
                            toAdd.push(el);
                        } else {
                        }

                        resolve();
                    }, err => {
                        resolve();
                    });
                }));
            });
        } else {
            toAdd = found;
        }

        Promise.all(promises).then(() => {
            let data = [];

            data.push({
                id: 'ID',
                team: 'Oddil',
                first_name: 'Jmeno',
                last_name: 'Prijmeni',
                sex: 'Pohlavi',
                birth_date: 'Datum narozeni',
                email: 'Email'
            });

            toAdd.forEach((el: Player) => {
                data.push({
                    id: el.id,
                    team: this.playerAtTeam.transform(el, true),
                    first_name: el.first_name,
                    last_name: el.last_name,
                    sex: (el.sex ? el.sex : ''),
                    birth_date: (el.birth_date ? el.birth_date : ''),
                    email: (el.email ? el.email : '')
                });
            });

            new Angular2Csv(data, 'CALD export', {showLabels: true});
            this.sending = false;
        });
    }

    public nationality(): void {
        this.nationalityForm = this.fb.group({
            id: [],
            name: ['', Validators.required],
            country_name: ['', Validators.required]
        });

        this.source.nationality = new LocalDataSource();
        this.source.nationality.setSort([{field: 'name', direction: 'asc'}]);
        this.source.nationality.load(this.server.getType("nationality"));
        this.type = "nationality";
    }

    public export(): void {
        this.exportForm = this.fb.group({
            sex: [],
            birth_date_comparator: [],
            birth_date: [],
            active_in_seasons_allowed: [],
            active_in_seasons: []
        });

        this.exportForm.patchValue({
            sex: '',
            birth_date_comparator: '==',
            active_in_seasons: [this.seasons[this.seasons.length - 1].id]
        });
        this.type = "export";
    }

    public user(): void {
        this.teamsOptions = [];
        this.server.getType("team").forEach(el => {
            this.teamsOptions.push({value: el.id, title: el.name});
        });
        this.source.user = new LocalDataSource();
        this.source.user.setSort([{field: 'teams', direction: 'asc'}]);
        this.server.get("list/user", {'extend': true}).subscribe(val => {
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
        this.source.team.setSort([{field: 'name', direction: 'asc'}]);
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
        this.source.tournament.setSort([{field: 'date', direction: 'desc'}]);

        let data = [];

        this.server.get("list/tournament").subscribe(val => {
            val.forEach((el: Tournament) => {
                console.log(el);
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
