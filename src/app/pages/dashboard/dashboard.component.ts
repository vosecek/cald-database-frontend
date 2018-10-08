import { Component } from '@angular/core';
import { ServerService } from '../../services/server.service';
import { TeamsService } from '../../services/teams.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Tournament } from '../../types/tournament';
import { Team } from '../../types/team';

import { OrderBy } from '../../pipes/order.pipe';

declare var pdfMake: any;

@Component({
    selector: 'dashboard',
    styleUrls: ['./dashboard.scss'],
    templateUrl: './dashboard.html'
})
export class Dashboard {

    public tournaments: Tournament[] = [];
    public rights: any[] = [];
    protected teams: any[] = [];
    feeLoading: boolean = false;
    fee_season_id: any;

    constructor(
        public server: ServerService,
        private teamsService: TeamsService,
        private router: Router,
        private order: OrderBy
    ) {

        this.rights = this.server.getTeam2Edit();
        this.fee_season_id = this.server.getType("season", new Date().getFullYear(), "id", "name");
        this.init();
    }

    protected showFee(): boolean {
        let date = new Date();
        if (this.feeLoading === true) return false;
        return (date.getMonth() > 8);
    }


    protected getFee(team: Team): void {
        this.feeLoading = true;
        this.server.get(["team", team.id, "season", this.fee_season_id, "fee"].join("/")).subscribe((feeData: any) => {

            var pdfContent = [];

            let tournament_roster = [];
            let division_header = [];

            var date = new Date();

            let table_body = [];
            let table_width = [];
            var table_header = [];

            let duplicita_table_body = [];
            let duplicita_table_width = [];
            var duplicita_table_header = [];

            var i = 0;
            while (division_header.length > i) {
                i++;
                table_width.push(45);
            }
            table_header.unshift({text: "Jméno hráče", bold: true});
            table_width.unshift("auto");
            table_header.push({text: "Poplatek", bold: true});
            table_width.push("auto");

            duplicita_table_header.unshift({text: "Jméno hráče", bold: true});
            duplicita_table_width.unshift("auto");
            duplicita_table_header.push({text: "Oddíly hráče", bold: true});
            duplicita_table_width.push("auto");

            var players = [];
            var member2pay = [];

            if (!feeData['fee'][team.name]) {
                alert("Nepodařilo se načíst data, kontaktujte prosím VR ČALD");
                this.feeLoading = false;
                return;
            }

            table_body.push(table_header);

            feeData['fee'][team.name].players.forEach((el, i) => {
                console.log(el);
                if (el) {
                    feeData['fee'][team.name].players[i] = el['name'].split(" ").reverse().join(" ");
                }
            });

            feeData['fee'][team.name].players = feeData['fee'][team.name].players.sort();

            feeData['fee'][team.name].players.forEach(player => {
                table_body.push([player, '400 Kč']);
            });

            duplicita_table_body.push(duplicita_table_header);

            if (feeData['duplicate_players']) {
                for (let i in feeData['duplicate_players']) {
                    let dup = feeData['duplicate_players'][i];
                    duplicita_table_body.push([dup.name, dup.teams.join(", ")]);
                }
            }

            var data = [{text: 'Česká asociace létajícího disku', style: 'pageHeader'},
                {
                    text: 'Pokyny k zaplacení členských příspěvků ' + ' ' + this.server.getType("season", this.fee_season_id, "name"),
                    style: 'header'
                },
                {text: "Název oddílu: " + team.name, bold: true, style: "list"},
                {text: "Datum vystavení dokladu: " + date.toLocaleDateString(), style: "list"},
                {text: "Částka: " + feeData['fee'][team.name].fee + ' Kč', style: "list"},
                {text: "Celkem členů platících v sezoně: " + feeData['fee'][team.name].players.length, style: "list"},
                {text: "Číslo účtu: " + "233012651/0300", style: "list"},
                {
                    text: "Variabilní symbol: " + new Date().getFullYear().toString().substring(2) + "000" + team.id,
                    style: "list"
                },
                {text: "Členové oddílu povinni zaplatit poplatek", style: "subHeader"},
                {
                    table: {
                        headerRows: 1,
                        widths: table_width,

                        body: table_body
                    }
                },
                {
                    text: "Hráči, kteří jsou registrování ve vašem oddíle, ale hráli také za jiný oddíl",
                    style: "subHeader"
                },
                {
                    table: {
                        headerRows: 1,
                        widths: duplicita_table_width,

                        body: duplicita_table_body
                    }
                }
            ];

            pdfContent.push(data);

            var docDefinition = {
                content: pdfContent,
                styles: {
                    list: {
                        margin: [0, 5]
                    },
                    header: {
                        fontSize: 22,
                        bold: true,
                        alignment: 'center',
                        margin: [0, 20]
                    },
                    subHeader: {
                        fontSize: 14,
                        bold: true,
                        margin: [0, 20, 0, 5]
                    },
                    pageHeader: {
                        fontSize: 18,
                        alignment: 'left'
                    },
                    textCenter: {
                        alignment: 'center'
                    }
                }
            };

            pdfMake.createPdf(docDefinition).download('fee.pdf');

            this.feeLoading = false;
        }, err => {
            this.feeLoading = false;
            alert(err);
        });
    }

    private init(): void {
        this.tournaments = [];

        if (this.server.isAdminMenu()) {
            this.teams = this.server.getType("team");
        } else {
            this.server.getRights().forEach(data => {
                if (data.length == 3) {
                    this.teams.push(this.teamsService.getTeam(data[2]));
                }
            });
        }

        let seasons = this.server.getType("season");

        this.server.get('list/tournament').subscribe(data => {
            let date = new Date();
            data.forEach(tournament => {
                if (new Date(tournament.date.split(" ")[0]) > date) {
                    tournament.date = new Date(tournament.date.split(" ")[0]);

                    tournament.divisions = this.server.getTournaments2league(tournament.id);
                    this.tournaments.push(tournament);

                    tournament.divisions.forEach(division => {
                        division.rosters = [];
                        this.server.get("list/roster", {'filter': {'tournament_belongs_to_league_and_division_id': division.id}}).subscribe(data => {
                            // nacteny soupisky pro divizi na turnaji
                            this.rights.forEach(team => {
                                let records = data.filter(item => {
                                    return item.team_id == team;
                                });
                                // soupisky oddilu pro divizi

                                if (records.length > 0) {
                                    if (!division.rosters[team]) division.rosters[team] = [];
                                    division.rosters[team] = records;
                                }
                            });
                        });
                    });
                }
            });
        });
    }

    public roster(r: any, id?: number): void {
        if (!id) {
            let division = this.server.getType("tournamentExtended", r.tournament_belongs_to_league_and_division_id);
            let tournament = this.server.getType("tournament", division.tournament_id);
            let season = this.server.getType("season", tournament.season_id);
            this.router.navigateByUrl(['app', 'seasons', season.name, tournament.id, r.tournament_belongs_to_league_and_division_id, r.id].join("/"));
        } else {
            this.server.post("roster", {
                team_id: id,
                tournament_belongs_to_league_and_division_id: r.id
            }).subscribe(val => {
                this.init();
            });
        }
    }

}
