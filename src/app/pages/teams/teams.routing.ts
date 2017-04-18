import { Routes, RouterModule, CanActivate } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { ModuleWithProviders } from '@angular/core';
import { TeamDetailComponent } from './team/team-detail.component';

export const routes: Routes = [
	{
		path: '',
		component: TeamsComponent
	},
	{
		path: ':id',
		component: TeamDetailComponent
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);