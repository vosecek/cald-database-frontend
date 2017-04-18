import { Component } from '@angular/core';
import { Team } from '../../types/team';
import { Player } from '../../types/player';
import { TeamsService } from '../../services/teams.service';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'teams-component',
  styles: ['teams.scss'],
  templateUrl: 'teams.component.html',
})

export class TeamsComponent {
  teams: Team[] = [];
  myTeams: Team[] = [];

  queryPlayer: string = "";
  foundPlayers: Player[] = [];

  constructor(
    private teamsService: TeamsService,
    public server: ServerService
  ) {
  }

  teamDetail(player: Player): void {
    console.log(player);
  }

  ngOnInit(): void {
    this.teams = this.server.getType("team");
    this.server.getRights().forEach(data => {
      if (data.length == 3) {
        this.myTeams.push(this.teamsService.getTeam(data[2]));
      }
    });
  }
}
