webpackJsonp([5],{1264:function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var i=e(0),s=e(63),r=e(96),o=e(304),a=e(1372),d=e(1436);e.d(n,"DashboardModule",(function(){return l}));var l=(function(){function t(){}return t=__decorate([e.i(i.i)({imports:[s.b,r.a,o.a,d.a],declarations:[a.a],providers:[]}),__metadata("design:paramtypes",[])],t)})()},1372:function(t,n,e){"use strict";var i=e(0),s=e(26),r=e(33);e.d(n,"a",(function(){return o}));var o=(function(){function t(t,n){this.server=t,this.router=n,this.tournaments=[],this.rights=[],this.rights=this.server.getTeam2Edit(),this.init()}return t.prototype.init=function(){var t=this;this.server.get("list/tournament").subscribe((function(n){var e=new Date;n.forEach((function(n){new Date(n.date.split(" ")[0])>e&&(n.date=new Date(n.date.split(" ")[0]),n.divisions=t.server.getTournaments2league(n.id),t.tournaments.push(n),n.divisions.forEach((function(n){n.rosters=[],t.server.get("list/roster",{filter:{tournament_belongs_to_league_and_division_id:n.id}}).subscribe((function(e){t.rights.forEach((function(t){var i=e.filter((function(n){return n.team_id==t}));i.length>0&&(n.rosters[t]||(n.rosters[t]=[]),n.rosters[t]=i)}))}))})))}))}))},t.prototype.roster=function(t,n){var e=this;if(n)this.server.post("roster",{team_id:n,tournament_belongs_to_league_and_division_id:t.id}).subscribe((function(t){console.log(t),e.init()}));else{var i=this.server.getType("tournamentExtended",t.tournament_belongs_to_league_and_division_id),s=this.server.getType("tournament",i.tournament_id),r=this.server.getType("season",s.season_id);this.router.navigateByUrl(["app","seasons",r.name,s.id,t.id].join("/"))}},t=__decorate([e.i(i._3)({selector:"dashboard",styles:[e(1468)],template:e(1473)}),__metadata("design:paramtypes",[s.a,r.b])],t)})()},1436:function(t,n,e){"use strict";var i=e(33),s=e(1372);e.d(n,"a",(function(){return o}));var r=[{path:"",component:s.a,children:[]}],o=i.a.forChild(r)},1468:function(t,n){t.exports="\n"},1473:function(t,n){t.exports='<div class="row">\n    <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">\n        <div *ngFor="let tournament of tournaments|order:[\'-name\']">\n            <ba-card title="{{tournament.name}}" baCardClass="with-scroll">\n                <p>{{tournament.location}}, {{tournament.date|date}}</p>\n                <div *ngFor=\'let division of tournament.divisions\' style=\'margin-bottom: 1em;\'>\n                    <h3>{{division.division_id|division}}</h3>\n                    <div *ngFor=\'let team of division.rosters;let team_id = index;\' style=\'display:inline;\'>\n                        <div *ngFor=\'let r of team;let i = index;\' style=\'display:inline;\'>\n                            <button (click)="roster(r)" class="btn btn-info btn-with-icon"><i class="ion-edit"></i>{{r.team_id|team}} {{i|teammark}}</button>\n                        </div>\n                    </div>\n                    <div style=\'margin-top: .5em;\'>\n                        <div *ngFor=\'let team of rights\' style=\'display: inline;\'>\n                            <button (click)="roster(division,team)" class="btn btn-success btn-with-icon"><i class="ion-plus"></i>Přidat tým {{team|team}}</button>\n                        </div>\n                    </div>\n                </div>\n            </ba-card>\n        </div>\n    </div>\n'}});