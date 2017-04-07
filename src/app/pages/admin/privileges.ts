import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

import { TeamsService } from '../../services/teams.service';

@Component({
	template: `
    {{renderValue}}
  `,
})
export class Privileges implements ViewCell, OnInit {

	constructor(private teamsService: TeamsService) {
	}

	renderValue: string;
	data: String[] = [];

	@Input() value: any;

	ngOnInit() {
		if (this.value.length > 0) {
			this.value.forEach(el => {
				this.data.push(this.teamsService.getTeam(el['entity_id'])['name'].toString());
			});
		}
		this.renderValue = this.data.join(", ");
	}
}