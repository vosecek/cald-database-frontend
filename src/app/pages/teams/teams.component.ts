import { Component } from '@angular/core';
import { Team } from '../../types/team';
import { TeamsService } from '../../services/teams.service';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'teams-component',
  styles: ['teams.scss'],
  templateUrl: 'teams.component.html'
})

export class TeamsComponent {
  teams: Team[] = [];
  myTeams: Team[] = [];

  constructor(
    private teamsService: TeamsService,
    private server: ServerService
  ) {
  }

  ngOnInit():void {
    this.teams = this.server.getType("team");
    this.server.getRights().forEach(data => {
      if (data.length == 3) {
        this.myTeams.push(this.teamsService.getTeam(data[2]));
      }
    });
  }
}
