import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { Admin } from './admin.component';
import { routing } from './admin.routing';

import { ReactiveFormsModule } from '@angular/forms';

import { Privileges } from './privileges';

import { ModalModule } from 'ng2-bootstrap';

import { DateCell } from "./dateCell";
import { TeamCell } from "./teamCell";



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
    ReactiveFormsModule,
    Ng2SmartTableModule,
    ModalModule.forRoot()
  ],
  entryComponents: [
    Privileges,
    DateCell,
    TeamCell
  ],
  declarations: [
    Admin,
    Privileges,
    DateCell,
    TeamCell
  ]
})
export class AdminModule { }