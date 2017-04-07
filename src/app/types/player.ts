export class Player {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	birth_date: string;
	sex: string;
	loading: boolean;
	info: boolean;
	edit: boolean;
	warning: boolean;

	constructor(){
		this.id = '';
		this.first_name = '';
		this.last_name = '';
		this.email = '';
		this.birth_date = '';
		this.sex = '';
		this.loading = false;
		this.info = false;
		this.edit = false;
		this.warning = false
	}
}
