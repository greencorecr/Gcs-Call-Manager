/*global $:false */
/*global ko:false */
/*global alertify:false */

'use strict';

// function parseForm (form) {
// 	var obj = {};
// 	var formArray = $(form).serializeArray();
// 	$.each(formArray, function(index, input) {
// 		obj[input.name] = input.value;
// 	});
// 	return obj;
// }

// function autoUsername (source, dst) {
// 	source = $(source);
// 	dst = $(dst);

// 	if (!dst.val()) {
// 		var value = source.val();
// 		dst.val(value);
// 	}
// }

var userViewModel = ko.viewmodel.fromModel({users: []}, {
	arrayChildId: {
		'{root}.users': 'id'
	},
	extend: {
		'{root}': function(root) {
				root.selectedUser = ko.observable({
					id: false,
					name: '',
					username: '',
					email: '',
					exten: '',
					password: '',
					role: '0',
				});
		}
	}
});

function parseMongooseErrorMsg(err) {
	//var alertText = [];
	Object.keys(err).forEach(function(key) {
		switch(key) {
			case 'name':
				$('.user-name').addClass('has-error');
				alertify.log('Error: '+err[key].message, 'error');
				break;
			case 'email':
				$('.user-email').addClass('has-error');
				alertify.log('Error: '+err[key].message, 'error');
				break;
			case 'exten':
				$('.user-exten').addClass('has-error');
				alertify.log('Error: '+err[key].message, 'error');
				break;
			case 'username':
				$('.user-username').addClass('has-error');
				alertify.log('Error: '+err[key].message, 'error');
				break;
			case 'hashed_password':
				$('.user-password').addClass('has-error');
				alertify.log('Error: '+err[key].message, 'error');
				break;
		}
	});	
}

function getUserList() {
	$.get('/api/users', function(data) {
		ko.viewmodel.updateFromModel(userViewModel, {users: data});
	});
}

getUserList();

function clearSelectedUser(newId) {
	newId = newId === 'new' ? newId : false;
	userViewModel.selectedUser({
		id: newId,
		name: '',
		username: '',
		email: '',
		exten: '',
		password: '',
		role: '0'
	});
	$('.form-group').removeClass('has-error');
}

/* exported markSelectedUser */ //needed for JsHint
function markSelectedUser(data) {
	if (userViewModel.selectedUser() !== data) {
		if (!data.password) {
			data.password = null;
		}
		userViewModel.selectedUser(data);
	} else {
		clearSelectedUser();
	}
}

/* exported isSelected */ //needed for JsHint
function isSelected(data) {
	if (userViewModel.selectedUser().id === data.id) {
		return 'isSelected';
	}
}

/* exported newUser */ //needed for JsHint
function newUser () {
	if ('new' !== userViewModel.selectedUser().id) {
		clearSelectedUser('new');
	}
}

/* exported saveUser */ //needed for JsHint
function saveUser() {
	var userData = ko.toJS(userViewModel.selectedUser);
	if ('new' === userData.id) {
		delete userData.id;
		$.post('/api/users', userData, function(msg) {
			if (1 === msg.ok) {
				alertify.log('User created succesfully', 'success');
				getUserList();
				clearSelectedUser();				
			} 
		}).error(function(obj) {
			parseMongooseErrorMsg(obj.responseJSON.errors);
		});
	} else {
		$.ajax({
			type: 'PUT',
			url: '/api/users',
			data: JSON.stringify(userData),
			contentType: 'application/json'
		}).error(function(obj) {
			parseMongooseErrorMsg(obj.responseJSON.errors);
		}).done(function(msg) {
			if (1 === msg.ok) {
				alertify.log('User updated succesfully', 'success');
				getUserList();
				clearSelectedUser();
			}
		});
	}
}

/* exported deleteUser */ //needed for JsHint
function deleteUser() {
	var userData = ko.toJS(userViewModel.selectedUser);
	if ((false !== userData.id) && ('new' !== userData.id)) {
		$.ajax({
			type: 'DELETE',
			url: 'api/users',
			data: JSON.stringify(userData),
			contentType: 'application/json'
		}).error(function(obj) {
			parseMongooseErrorMsg(obj.responseJSON.errors);
		}).done(function(msg) {
			if (1 === msg.ok) {
				alertify.log('User deleted succesfully', 'success');
				getUserList();
				clearSelectedUser();
			}
		});
	}
}

ko.applyBindings(userViewModel);