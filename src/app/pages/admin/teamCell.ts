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

	@Input() value: string;

	ngOnInit() {
		if (this.value) {
			var data = [];
			this.value.split(",").forEach(el => {
				data.push(this.teamPipe.transform(el));
			});
			this.renderValue = data.join(", ");
		}
	}

}