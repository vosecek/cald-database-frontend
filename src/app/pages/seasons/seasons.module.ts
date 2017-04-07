import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { Seasons } from './seasons.component';
import { SeasonDetail } from './season/season-detail.component';
import { TournamentComponent } from './season/tournament/tournament.component';
import { RosterComponent } from './season/tournament/roster/roster.component';
import { routing } from './seasons.routing';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule,
		routing
	],
	declarations: [
		SeasonDetail,
		Seasons,
		TournamentComponent,
		RosterComponent
	]
})
export class SeasonsModule { }
