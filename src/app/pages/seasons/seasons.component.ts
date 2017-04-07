import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Season } from '../../types/season';
import { ServerService } from '../../services/server.service';
import { SeasonsService } from '../../services/seasons.service';
import { Observable } from 'rxjs/Rx';

import { OrderBy } from '../../pipes/order.pipe';

@Component({
  selector: 'seasons-component',
  styles: ['seasons.scss'],
  templateUrl: 'seasons.html'
})

export class Seasons {
  seasons: Season[] = [];

  constructor(
    private server: ServerService,
    private router: Router,
    private seasonsService: SeasonsService
  ) {
  }

  public getTournaments(id: number): Observable<any> {
    return this.server.get('list/tournament', { 'filter': { 'season_id': id }, 'extend': true }).map(tournaments => tournaments);
  }

  ngOnInit(): void {
    this.seasons = this.server.getType("season");
  }
}
