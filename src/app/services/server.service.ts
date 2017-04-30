import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import { Router, Routes } from '@angular/router';

import { Team } from '../types/team';
import { Season } from '../types/season';
import { Tournament } from '../types/tournament';
import { Player } from '../types/player';
import { Division } from '../types/division';
import { League } from '../types/league';
import { TournamentExtended } from '../types/tournamentextended';

import { PAGES_MENU } from '../pages/pages.menu';

// Statics
import 'rxjs/add/observable/throw';

// Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class ServerService {
    public api = 'http://api.evidence.cald.cz/';
    // public api = 'http://cald.yosarin.net/';
    

    public divisions: Division[];
    public leagues: League[];
    private tournamentExtended: TournamentExtended[];
    public tournamentExtendedFull: Array<any>;

    private players: Player[];
    private teams: Team[];
    private seasons: Season[];
    private tournaments: Tournament[];

    private user: any;
    private rights: Array<any> = [];

    private toLoad: number = 6;

    constructor(
        private http: Http,
        private router: Router
    ) {
        
    }

    public permission(id: string): any {
        let access = false;
        this.rights.forEach(val => {
            if (val[2] == id || val[0] == 'admin') {
                access = val[0];
            }
        });
        return access;
    }

    public getUser(): any {
        return this.user;
    }

    public getTeam2Edit(): any {
        let data = [];
        this.rights.forEach(el => {
            if (el.length == 3 && el[0] == "edit") {
                data.push(el[2]);
            }
        });
        return data;
    }

    public getRights(): any {
        return this.rights;
    }

    public reload(type: string): Promise<any> {
        if (type == 'team') {
            return new Promise((resolve, reject) => {
                this.get("list/team").subscribe(data => {
                    this.teams = data;
                    resolve(this.teams);
                }, err => {
                    reject(err);
                })
            });
        }

        if (type == 'tournamentExtendedFull') {
            return new Promise((resolve, reject) => this.get("list/tournament_belongs_to_league_and_division").subscribe(data => {
                this.tournamentExtendedFull = data;
                resolve(this.tournamentExtendedFull);
            }));
        }
    }

    public init(): Promise<any> {
        console.info('init app data');
        return Promise.all([
            new Promise((resolve, reject) => {
                this.get("list/tournament").subscribe(data => {
                    this.tournaments = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/division").subscribe(data => {
                    this.divisions = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/league").subscribe(data => {
                    this.leagues = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/tournament_belongs_to_league_and_division").subscribe(data => {
                    this.tournamentExtended = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("user/me").subscribe((val) => {
                    this.user = val['user'];
                    this.rights = [];
                    let data = [];
                    val['rights'].forEach(el => {
                        this.rights.push(el.split(":"));
                    });
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/player").subscribe(data => {
                    this.players = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/season").subscribe(data => {
                    this.seasons = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            }),
            new Promise((resolve, reject) => {
                this.get("list/team").subscribe(data => {
                    this.teams = data;
                }, err => {
                    resolve();
                }, () => {
                    resolve();
                })
            })]).then(val => {
                return true;
            }, err => {
                console.log(err);
            });
    }

    public isAdminMenu(): boolean {
        var access = false;
        this.rights.forEach(val => {
            if (val[0] == 'admin') {
                access = true;
            }
        });
        return access;
    }

    public isAdmin(): Promise<boolean> {
        var access = false
        if (this.rights.length == 0) {
            return new Promise((resolve, reject) => {
                this.get("user/me").subscribe((val) => {
                    val.rights.forEach(el => {
                        el = el.split(":");
                        if (el[0] == 'admin') {
                            resolve(true);
                        }
                    });
                    resolve(false);
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                this.rights.forEach(val => {
                    if (val[0] == 'admin') {
                        resolve(true);
                    }
                });
                resolve(false);
            });
        }
    }

    public getTournaments2league(id: string): TournamentExtended[] {
        return this.tournamentExtended.filter(record => record.tournament_id == id.toString());
    }

    public getType(type: string, val?: string, prop?: string, key?: string, filter?: boolean): any {
        if (!key) key = "id";
        if (!filter) filter = false;

        let data: any;
        if (type == "player") data = this.players;
        if (type == "team") data = this.teams;
        if (type == "season") data = this.seasons;
        if (type == "tournament") data = this.tournaments;
        if (type == "league") data = this.leagues;
        if (type == "division") data = this.divisions;
        if (type == "tournamentExtended") data = this.tournamentExtended;

        if (typeof data == "undefined") {
            console.error("Chybi data pro " + type);
            return false;
        }

        if (!val) {
            return data;
        }

        if (filter) {

            return data.filter((record: any) => record[key] == val.toString());
        } else {
            var record = data.find((record: any) => record[key] == val.toString());

            if (!prop) {
                return record;
            } else {
                return record[prop];
            }
        }
    }

    public post(path: string, params = {}): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.tokenUrl(path), params, options).map(this.extractData).catch(this.handleError.bind(this));
    }

    public put(path: string, params = {}): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(this.tokenUrl(path), params, options).map(this.extractData).catch(this.handleError.bind(this));
    }

    public delete(path: string, params = {}): Observable<any> {
        let query = "";
        let q: URLSearchParams = new URLSearchParams();
        for (var i in params) {
            q.set(i, params[i]);
        }

        query = q.toString();
        if (query.length > 0) {
            query = "&" + query;
        }

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(this.tokenUrl(path) + query, options).map(this.extractData).catch(this.handleError.bind(this));
    }

    public get(path: string, pars?: Object): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();

        params.set('token', this.token());

        if (typeof pars !== 'undefined') {
            for (let i in pars) {
                if (typeof pars[i] === 'object') {
                    for (let ii in pars[i]) {
                        params.set(i + '[' + ii + ']', pars[i][ii]);
                    }
                } else {
                    params.set(i, pars[i]);
                }
            }
        }
        return this.http.get(this.api + path, { search: params }).map(this.extractData).catch(this.handleError.bind(this));
    }

    protected extractData(res: Response) {
        let body = res.json();
        return body.data || body || {};
    }

    protected handleError(error: Response | any) {
        console.log(error);
        let errMsg = error.json();
        if (errMsg.error) {
            // alert(errMsg.error);
        }

        if (error.status === 403) {
            this.router.navigate(['/login']);
        }
        return Observable.throw(errMsg.error);
    }

    private token(): any {
        let agent = JSON.parse(localStorage.getItem('agent'));
        if (!agent) return false;
        return agent.token;
    }

    private tokenUrl(path: string): string {
        return this.api + path + '?token=' + this.token();
    }
}
