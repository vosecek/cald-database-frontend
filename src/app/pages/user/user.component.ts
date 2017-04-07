import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../services/server.service';

import { User } from './user';
import { UserService } from '../../services/user.service';
import { TeamsService } from '../../services/teams.service';
import { Team } from '../../types/team';

import { EmailValidator } from '../../validators/validator';



@Component({
	selector: 'user-component',
	styles: [],
	templateUrl: 'user.html'
})

export class UserComponent implements AfterViewInit {

	public user: User;
	form: FormGroup;
	teams: Array<Team> = [];

	sending: boolean = false;


	constructor(
		private server: ServerService,
		private userService: UserService,
		private teamsService: TeamsService,
		private fb: FormBuilder
	) {
		this.form = this.fb.group({
			'email': ['', [Validators.required, EmailValidator]],
			'login': ['', Validators.required],
			'passwords': this.fb.group({
				password: '',
				password2: ''
			}, { validator: this.areEqual })
		});
	}


	areEqual(group: FormGroup) {
		var valid = false;

		let value = false;
		for (let x in group.controls) {
			var val = group.controls[x].value;
			if (value !== false && val == value) valid = true;
			value = val;
		}
		if (valid) {
			return null;
		}

		return {
			areEqual: true
		};
	}

	send(): void {
		if (this.sending) return;
		this.sending = true;
		let data = {};
		data['login'] = this.form.value.login;
		data['email'] = this.form.value.email;

		if (this.form.value.passwords.password.length > 0) {
			data['password'] = this.form.value.passwords.password;
		}
		this.userService.updateUser(data).subscribe(val => {
			alert("Údaje aktualizovány");
		}, () => { }, () => {
			this.sending = false;
		});
	}

	ngAfterViewInit(): void {
		this.teams = [];
		this.user = this.server.getUser();
		this.form.get('email').setValue(this.user.email);
		this.form.get('login').setValue(this.user.login);
		this.server.getRights().forEach(data => {
			if (data.length == 3) {
				this.teams.push(this.teamsService.getTeam(data[2]));
			}
		});
	}
}
