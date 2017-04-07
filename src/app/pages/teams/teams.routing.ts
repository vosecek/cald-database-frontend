import { Routes, RouterModule, CanActivate } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { ModuleWithProviders } from '@angular/core';
import { TeamDetailComponent } from './team/team-detail.component';

import { TeamGuard } from '../guards/team.guard';

export const routes: Routes = [
	{
		path: '',
		component: TeamsComponent
	},
	{
		path: ':id',
		component: TeamDetailComponent,
		// canActivate: [TeamGuard]
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);