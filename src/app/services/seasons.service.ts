import { Injectable, OnInit } from '@angular/core';
import { ServerService } from './server.service';
import { Observable } from 'rxjs/Rx';

import { Season } from '../types/season';

@Injectable()
export class SeasonsService {

	public seasons: Season[];

	constructor(private server: ServerService) {
	}

	public getTournaments(id: any): Observable<any> {
		return this.server.get('list/tournament', { 'filter': { 'season_id': id }, 'extend': true }).map(tournaments => tournaments);
	}

	public getSeason(year: any): Season {
		return this.server.getType("season").find(season => season.name == year.toString());
	}
}
