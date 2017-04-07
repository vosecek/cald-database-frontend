import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { UserComponent } from './user.component';
import { routing } from './user.routing';

@NgModule({
	imports: [
		CommonModule,
		NgaModule,
		routing,
		ReactiveFormsModule
	],
	declarations: [
		UserComponent
	],
	providers: [
	]
})
export class UserModule { }