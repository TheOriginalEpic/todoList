import { Meteor } from 'meteor/meteor';	

import '../lib/collections.js';

Meteor.startup(() => {
// code to run on server at startup
	if (Meteor.isServer) {
	  	Meteor.startup(function() {
	  		return Meteor.methods({
	  			removeTasks: function() {
	  				return todoDB.remove({});
		     	}
			});
		});
	}
});