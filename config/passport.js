


'use strict';

/*
 * Module dependencies.
 */

 const mongoose = require('mongoose');
 const local = require('./passport/local');
// const github = require('./passport/github');

 const User = mongoose.model('User');


 /**
 * Expose
 */

 module.exports = function (passport){
 	// serialize and deserialize sessions
	passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
	}); 	
 	//
  passport.deserializeUser((id, cb) => User.load({ criteria: { _id: id } }, cb));

 	// use these strategies
 	passport.use(local);
 	//passport.use(github);
 }