import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app/dashboard' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });
