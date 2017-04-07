import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import { IsAdmin } from './guards/admin.guard';
import { DataLoaded } from './guards/loaded.guard';

@NgModule({
	imports: [CommonModule, NgaModule, routing],
	declarations: [Pages],
	providers: [DataLoaded, IsAdmin]
})
export class PagesModule {
}
