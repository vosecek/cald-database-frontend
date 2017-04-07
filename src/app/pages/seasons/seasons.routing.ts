import { Routes, RouterModule } from '@angular/router';
import { Seasons } from './seasons.component';
import { ModuleWithProviders } from '@angular/core';
import { SeasonDetail } from './season/season-detail.component';
import { TournamentComponent } from './season/tournament/tournament.component';
import { RosterComponent } from './season/tournament/roster/roster.component';

export const routes: Routes = [
	{
		path: '',
		component: Seasons
	},
	{
		path: ':year',
		component: SeasonDetail
	},
	{
		path: ':year/:tournament',
		component: TournamentComponent
	},
	{
		path: ':year/:tournament/:roster',
		component: RosterComponent
	}

];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);