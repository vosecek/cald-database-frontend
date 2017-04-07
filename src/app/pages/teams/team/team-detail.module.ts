import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamDetailComponent } from './team-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {BirthDate } from './birthDate';

import { NgaModule } from '../../theme/nga.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule
	],
	entryComponents: [
		BirthDate
	],
	declarations: [
		TeamDetailComponent,
		BirthDate
	],
	providers: [
	]
})
export class TeamDetailModule { }
