import { NgModule } from '@angular/core';
import { NgaModule } from '../../theme/nga.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { TeamDetailComponent } from './team/team-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './teams.routing';
import { ModalModule } from 'ng2-bootstrap';

import { TeamGuard } from '../guards/team.guard';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { BirthDate } from './team/birthDate';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule,
		routing,
		Ng2SmartTableModule,
		ReactiveFormsModule
		ModalModule.forRoot()
	],
	entryComponents: [
		BirthDate
	],
	declarations: [
		TeamsComponent,
		TeamDetailComponent,
		BirthDate
	],
	providers: [
		TeamGuard
	]
})

export class TeamsModule { }