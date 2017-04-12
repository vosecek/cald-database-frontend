import { Component } from '@angular/core';
import { Routes, Router } from '@angular/router';

import { BaMenuService } from '../theme';
import { PAGES_MENU } from './pages.menu';
import { SeasonsService } from '../services/seasons.service';
import { ServerService } from '../services/server.service';

import { OrderBy } from '../pipes/order.pipe';

@Component({
  selector: 'pages',
  template: `
    <ba-sidebar></ba-sidebar>
    <ba-page-top></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        <ba-content-top></ba-content-top>
        <router-outlet></router-outlet>
      </div>
    </div>
    <footer class="al-footer clearfix">
      <div class="al-footer-main clearfix">
        <div class="al-copy">&copy; <a href="http://www.cald.cz/">ČALD</a> 2017</div>
      </div>
    </footer>
    <ba-back-top position="200"></ba-back-top>
    `
})
export class Pages {

  constructor(
    private _menuService: BaMenuService,
    private order: OrderBy,
    private router: Router,
    private server: ServerService
  ) {

  }

  ngOnInit() {  
    this._menuService.updateMenuByRoutes(<Routes>PAGES_MENU);
  }
}