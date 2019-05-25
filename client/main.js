import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Accounts } from 'meteor/accounts-base';

import './main.html';
import '../lib/collections.js';

Session.set('taskLimit', 10);
Session.set('userFilter', false);

lastScrollTop = 0;
$(window).scroll(function(event){

	if ($(window).scrollTop() + $(window).height() > $(document).height() - 100){
		var scrollTop = $(this).scrollTop();

		if (scrollTop > lastScrollTop){
			Session.set('taskLimit', Session.get('taskLimit') + 5);			
		}
		lastScrollTop = scrollTop;
	}
});

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

Template.top.helpers({
	tasksFound(){
  		return todoDB.find({}).count({});
  	},
});

Template.main.helpers({
  	mainAll() {
  		var userId = Meteor.userId();
  		var privated = $('#Privated').val();

  		if (Session.get("userFilter") == false){
	  		var time = new Date() - 15000;
	  		var results = todoDB.find({'createdOn': {$gte:time}}).count();

	  		if (results > 0){
	  			return todoDB.find({$or:[{private:{$eq:false}}, {$and:[{private:{$eq:privated}}, {postedBy:{$eq:userId}}]}]}, {sort:{createdOn: -1}, limit:Session.get('taskLimit')});
	  		} else {
	    		return todoDB.find({$or:[{private:{$eq:false}}, {$and:[{private:{$eq:privated}}, {postedBy:{$eq:userId}}]}]}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
	    	}

    	} else {
    		return todoDB.find({postedBy:Session.get("userFilter")}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
    	}
  	},

  	taskAge(){
  		var taskCreatedOn = todoDB.findOne({_id:this._id}).createdOn;
  		taskCreatedOn = Math.round((new Date() - taskCreatedOn) / 60000);

  		var unit = " mins";

  		if (taskCreatedOn > 60){
  			taskCreatedOn = Math.round(taskCreatedOn / 60);
  			unit = " hours";
  		}

  		if (taskCreatedOn > 1440){
  			taskCreatedOn = Math.round(taskCreatedOn / 1440);
  			unit = " days";

  		}
  		return taskCreatedOn + unit;
  	},

  	userLoggedIn(){
  		var logged = todoDB.findOne({_id:this._id}).postedBy;
  		return Meteor.users.findOne({_id:logged}).username;
  	},

  	userId(){
  		return todoDB.findOne({_id:this._id}).postedBy;
  	},

  	isCompleted(){
  		if(Session.get('check') == true){
  			if(todoDB.findOne({_id:this._id}).checked == true){
  				console.log(todoDB.findOne({_id:this._id}).checked);
  				return Session.get('check');  				
  			}
  		} else {
  			$('#' + this._id).removeClass('hideTasks');
  			console.log(Session.get('check'));
  			return Session.get('check');  			
  		}
  	},
});

Template.main.events({
	'click .js-delete'(event, instance){
		var deleteID = this._id;

		var confirmation = confirm("Are you sure you want to delete this");

		if (confirmation == true) {
			$('#' + deleteID).fadeOut('slow','swing', function(){
				todoDB.remove({_id:deleteID});
			});			
		}	
	},

	'click .js-edit'(event, instance){
		var editID = this._id;

		$('#editTodo').modal('show');

		$('#changeTodo').val(todoDB.findOne({_id:editID}).task);
		$('#editTodoID').val(todoDB.findOne({_id:editID})._id);
	},

	'click .usrClick'(event, instance){
		event.preventDefault();
		Session.set("userFilter", event.currentTarget.id);
	},

	'click .completed'(event, instance){
		var compID = this._id;

		if($('.completed').is(':checked')){
			todoDB.update({_id: compID}, {$set:{'checked':true}});
		} else {
			todoDB.update({_id: compID}, {$set:{'checked':false}});
		}
	}
});

Template.top.events({
	'click .js-submit'(event, instance){
		var Task = $('#newTask').val();
		var privated = $('#Privated').val();

		if (Task == ""){
			Task = "No Task";
		}

		if($('#private').is(':checked')){
			todoDB.insert({'task':Task, 'private':privated, 'checked':false, 'createdOn':new Date().getTime(), 'postedBy':Meteor.user()._id});
			$("#private").prop("checked", false);
			$("#newTask").val('');
		} else {
			todoDB.insert({'task':Task, 'private':false, 'checked':false, 'createdOn':new Date().getTime(), 'postedBy':Meteor.user()._id});
			$("#newTask").val('');
		} 
	},

	'click #hide'(event, instance){
		if($('#hide').is(':checked')){
			Session.set("check", event.currentTarget.checked);
		} else {
			Session.set("check", event.currentTarget.checked);
		}
	},
});

Template.editTodo.events({
	'click .js-editSave'(event, instance){
		var Save = $('#editTodoID').val();
		var Todo = $('#changeTodo').val();

		todoDB.update({_id: Save}, {$set:{'task':Todo, 'createdOn':new Date().getTime()}});

		$('#changeTodo').val('');
		$('#editTodo').modal('hide');
	},
});