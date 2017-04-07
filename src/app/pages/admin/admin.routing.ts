import { Routes, RouterModule }  from '@angular/router';

import { Admin } from './admin.component';
import { ModuleWithProviders } from '@angular/core';

// noinspection TypeScriptValidateTypes
export const routes: Routes = [
  {
    path: '',
    component: Admin,
    children: [
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
