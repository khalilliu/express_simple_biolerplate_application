

/*!
 * Module dependencies
 */

 var mongoose = require('mongoose');
 var userPlugin = require('mongoose-user');

 var Schema = mongoose.Schema;

 //user schema

 var UserSchema = new Schema({
 	name: {type: String , default: ''},
 	email: {type: String, default: ''},
 	hashed_password: {type: String, default: ''},
 	salt: {type: String, default: ''},
 })


 //user plugin

 UserSchema.plugin(userPlugin, {});

 //add methods

 UserSchema.method({

 });

 //static

 UserSchema.static({

 });

 mongoose.model('user',UserSchema);