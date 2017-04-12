import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

@Component({
	template: `
    {{renderValue}}
  `,
})
export class BirthDate implements ViewCell, OnInit {

	renderValue: string;

	@Input() value: string | number;

	ngOnChanges(){
		console.log('changes');
	}

	ngOnInit() {
		if (this.value) {
			this.renderValue = this.value.toString().toUpperCase();
		}
	}

}