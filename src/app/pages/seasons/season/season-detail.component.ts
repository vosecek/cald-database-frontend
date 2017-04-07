import { Component, OnInit } from '@angular/core';
import { Season } from '../../../types/season';
import { Tournament } from '../../../types/tournament';
import { ActivatedRoute, Params } from '@angular/router';
import { ServerService } from '../../../services/server.service';
import { SeasonsService } from '../../../services/seasons.service';

@Component({
	selector: 'season-detail',
	templateUrl: 'season-detail.html'
})

export class SeasonDetail {

	season: Season;
	tournaments: Tournament[];


	constructor(
		private route: ActivatedRoute,
		public server: ServerService,
		private seasonsService: SeasonsService
	) {
	}

	ngOnInit(): void {
		this.route.params.forEach((params: Params) => {
			let year = +params['year'];

			this.season = this.seasonsService.getSeason(year);
			this.seasonsService.getTournaments(this.season.id).subscribe(tournaments => {
				console.log(tournaments);
				this.tournaments = [];
				tournaments.forEach((data: Tournament) => {
					var extended = this.server.getType("tournamentExtended", data.id);
					data['league_name'] = this.server.getType("league", extended['league_id'],"name");
					data['division_name'] = this.server.getType("division", extended['division_id'], "name");
					data['date'] = new Date(data['date'].split(" ")[0]);
					this.tournaments.push(data);
				});
			});
		});
	}
}
