import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'intersect' })
export class IntersectPipe implements PipeTransform {

	transform(source: any[], source2: any[]): any {
		let data = [];
		for (var i in source) {
			if ((source2.filter(item => item['id'] == source[i]['id'])).length == 0) {
				data.push(source[i]);
			}
		}
		return data;
	}
}