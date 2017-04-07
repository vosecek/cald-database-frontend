import { Component } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';

import { GlobalState } from '../../../global.state';
import { PAGES_MENU } from '../../../pages/pages.menu';
import { Router, NavigationStart, NavigationError, NavigationCancel, NavigationEnd, RoutesRecognized } from '@angular/router';

import { SeasonsService } from '../../../services/seasons.service';
import { ServerService } from '../../../services/server.service';
import { TeamsService } from '../../../services/teams.service';

import { DivisionPipe } from '../../../pipes/division.pipe';

// import { Tournament } from '../../../types/tournament';
// import { Tournament } from '../../../types/seaso';


@Component({
  selector: 'ba-content-top',
  styleUrls: ['./baContentTop.scss'],
  templateUrl: './baContentTop.html',
})
export class BaContentTop {

  public activePageTitle: string = '';
  public breadcrumbs: any[];

  private path: any[];
  private season: any;

  // private 

  constructor(
    private _state: GlobalState,
    private router: Router,
    private seasons: SeasonsService,
    private server: ServerService,
    private teams: TeamsService,
    private route: ActivatedRoute,
    private divisionPipe: DivisionPipe
  ) {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe((val: NavigationEnd) => {
      this.setBreadcrumbs(val);
    });

    this._state.subscribe('menu.activeLink', (activeLink) => {
      // this.setBreadcrumbs();
      // console.log(activeLink);

      if (activeLink) {
        this.activePageTitle = activeLink.title;
      }
    });
  }

  private hasChildren(): void {
  }


  private isMenu(key: string, master: any[]): string {
    let menuTitle = '';
    master.forEach(el => {
      if (!el.children) return;
      if (el.path == key) {
        menuTitle = el.title;
        return;
      }
      var item = el.children.filter(x => x.path == key);
      if (item.length == 0) {
        if (el.children) {
          menuTitle = this.isMenu(key, el.children);
        }
      } else {
        menuTitle = item[0]['data'].menu.title;
        return menuTitle;
      }
    });

    return menuTitle;
  }

  private setBreadcrumbs(val): void {
    this.path = [];
    this.breadcrumbs = [];

    let title = '';
    let url = val.url.split("/");
    var i = 0;
    url.forEach((el) => {
      i++;
      title = '';
      if (i == 1) return;
      var isMenuTitle = this.isMenu(el, PAGES_MENU);
      if (isMenuTitle) {
        title = isMenuTitle;
      } else {
        title = el;
      }

      this.path.push(el);

      this.breadcrumbs.push({ last: false, path: "/" + this.path.join("/"), key: el, title: title });

      if (this.path.length == 3) {
        switch (this.path[1]) {
          case "teams":
            this.detectTeam();
            break;

          default:
            // code...
            break;
        }
      }

      if (this.path.length == 4) {
        switch (this.path[1]) {
          case "seasons":
            this.detectTournament();
            break;

          default:
            // code...
            break;
        }
      }

      if (this.path.length == 5) {
        switch (this.path[1]) {
          case "seasons":
            this.breadcrumbs[4]['title'] = "Soupiska týmu";
            break;

          default:
            // code...
            break;
        }
      }
    });

    if (this.breadcrumbs.length > 0) {
      this.breadcrumbs[this.breadcrumbs.length - 1].last = true;
    }
  }

  private detectTeam(): void {
    this.breadcrumbs[2]['title'] = this.teams.getTeam(this.path[2])['name'];
  }

  private detectTournament(): void {
    let season_id = this.seasons.getSeason(this.path[2]);
    this.seasons.getTournaments(season_id['id']).subscribe(tournaments => {
      tournaments.forEach((data: any) => {
        if (data['id'] == this.breadcrumbs[3]['key']) {
          this.breadcrumbs[3]['title'] = data['name'];
        }
      });
    })
  }
}