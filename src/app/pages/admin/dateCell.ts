import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
    {{renderValue}}
  `,
})
export class DateCell implements ViewCell, OnInit {

	renderValue: string;

	@Input() value: string;

	ngOnInit() {
		if (this.value) {
			let date = new Date(this.value.split(" ")[0]);
			if (isNaN(date.getTime())) {
				this.renderValue = "?";
			} else {
				this.renderValue = date.toLocaleString();
			}

		}
	}

}