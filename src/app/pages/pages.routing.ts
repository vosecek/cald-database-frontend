import { Routes, RouterModule, CanLoad } from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders, Injectable } from '@angular/core';

import { DataLoaded } from './guards/loaded.guard';
import { IsAdmin } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule'
  },
  {
    path: 'app',
    component: Pages,
    resolve: {
      data: DataLoaded
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard', loadChildren: 'app/pages/dashboard/dashboard.module#DashboardModule',
      },
      { path: 'user', loadChildren: 'app/pages/user/user.module#UserModule' },
      { path: 'seasons', loadChildren: 'app/pages/seasons/seasons.module#SeasonsModule' },
      { path: 'teams', loadChildren: 'app/pages/teams/teams.module#TeamsModule' },
      { path: 'admin', loadChildren: 'app/pages/admin/admin.module#AdminModule', canLoad: [IsAdmin] }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
