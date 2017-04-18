import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import { IsAdmin } from './guards/admin.guard';
import { DataLoaded } from './guards/loaded.guard';

import { RosterComponent } from './seasons/season/tournament/roster/roster.component';

@NgModule({
	imports: [CommonModule, NgaModule, routing],
	declarations: [Pages],
	providers: [DataLoaded, IsAdmin, RosterComponent]
})
export class PagesModule {
}
