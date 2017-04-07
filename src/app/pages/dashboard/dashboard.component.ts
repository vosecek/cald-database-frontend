import { Component } from '@angular/core';
import { ServerService } from '../../services/server.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Tournament } from '../../types/tournament';

@Component({
	selector: 'dashboard',
	styleUrls: ['./dashboard.scss'],
	templateUrl: './dashboard.html'
})
export class Dashboard {

	public tournaments: Tournament[] = [];
	public rights: any[] = [];

	constructor(
		private server: ServerService,
		private router: Router
	) {

		this.rights = this.server.getTeam2Edit();

		this.init();
	}

	private init():void {
		this.server.get('list/tournament').subscribe(data => {
			let date = new Date();
			data.forEach(tournament => {
				if (new Date(tournament.date.split(" ")[0]) > date) {
					// console.log(tournament.date);
					tournament.date = new Date(tournament.date.split(" ")[0]);

					tournament.divisions = this.server.getTournaments2league(tournament.id);
					this.tournaments.push(tournament);

					tournament.divisions.forEach(division => {
						division.rosters = [];
						this.server.get("list/roster", { 'filter': { 'tournament_belongs_to_league_and_division_id': division.id } }).subscribe(data => {
							// nacteny soupisky pro divizi na turnaji
							this.rights.forEach(team => {
								let records = data.filter(item => { return item.team_id == team });
								// soupisky oddilu pro divizi

								if (records.length > 0) {
									if (!division.rosters[team]) division.rosters[team] = [];
									division.rosters[team] = records;
								}
							});
						});
					});
				}
			})
		});
	}

	public roster(r: any,id?:number): void {
		if (!id) {
			let division = this.server.getType("tournamentExtended", r.tournament_belongs_to_league_and_division_id);
			let tournament = this.server.getType("tournament",division.tournament_id);
			let season =this.server.getType("season", tournament.season_id);
			this.router.navigateByUrl(['app','seasons',season.name,tournament.id,r.id].join("/"));
		} else {
			this.server.post("roster",{team_id:id,tournament_belongs_to_league_and_division_id:r.id}).subscribe(val=>{
				console.log(val);
				this.init();
			});
		}
	}

}
