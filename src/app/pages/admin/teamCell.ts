import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

import { TeamPipe } from '../../pipes/team.pipe';

@Component({
	template: `
    {{renderValue}}
  `,
})
export class TeamCell implements ViewCell, OnInit {

	constructor(
		private teamPipe: TeamPipe
	) {

	}

	renderValue: string;

	@Input() value: any[];

	ngOnInit() {
		if (this.value) {
			var data = [];
			this.value.forEach(el => {
				if (el.entity_id) {
					data.push(this.teamPipe.transform(el.entity_id));
				} else {
					data.push(this.teamPipe.transform(el));
				}
			});
			this.renderValue = data.join(", ");
		}
	}

}