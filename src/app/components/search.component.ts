import { Component, Input, Host, Optional } from '@angular/core';
import { Team } from '../types/team';
import { Player } from '../types/player';
import { ServerService } from '../services/server.service';

import { RosterComponent } from '../pages/seasons/season/tournament/roster/roster.component'

@Component({
  selector: 'search',
  templateUrl: 'search.component.html'
})

export class SearchComponent {
  @Input() type: string;

  queryPlayer: string = "";
  foundPlayers: Player[] = [];

  constructor(
    public server: ServerService,
    @Optional() @Host() public rosterComp: RosterComponent
  ) {
  }

  teamDetail(player: Player): void {
    console.log(player);
  }

  public searchPlayer(): void {
    if (this.queryPlayer.length > 2) {
      let players = this.server.getType("player");
      this.queryPlayer = this.queryPlayer.toLowerCase();
      this.foundPlayers = players.filter(item => {
        let queries = this.queryPlayer.split(" ");
        let found = 0;
        queries.forEach(el => {
          if ((item.first_name && item.first_name.toLowerCase().search(el) > -1) || (item.last_name && item.last_name.toLowerCase().search(el) > -1)) {
            found++;
          }
        });

        if (found == queries.length) return true;
        return false;
      });
    }
  }
}
