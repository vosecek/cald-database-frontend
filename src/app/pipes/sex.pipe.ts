import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'sex', pure: false  })
export class SexPipe implements PipeTransform {

	transform(input: any, sex: string): any {
		return input.filter(item => item.sex == sex);
	}
}