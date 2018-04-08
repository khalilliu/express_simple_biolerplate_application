

/*!
 * Module dependencies
 */

 var mongoose = require('mongoose');
 var crypto = require('crypto');
 // var userPlugin = require('mongoose-user');

 var Schema = mongoose.Schema;

const oAuthTypes = [
  'github',
  'twitter',
  'facebook',
  'google',
  'linkedin'
];
 //user schema

 var UserSchema = new Schema({
 	name: {type: String , default: ''},
 	email: {type: String, default: ''},
 	username: {type: String, default:''},
 	provider: {type: String, default: ''},
 	hashed_password: {type: String, default: ''},
 	salt: {type: String, default: ''},
 	authToken: {type: String, default: ''},
 	github: {}
 });


const validatePresenceOf = value => value&&value.length;


UserSchema
	.virtual('password')
	.set(function (password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function(){
		return this._password;
	})

//validations
UserSchema.path('name').validate(function(name){
	if(this.skipValidation())return true;
	return name.length;
},'Name can not be blank');

UserSchema.path('email').validate(function(email){
	if(this.skipValidation())return true;
	return email.length;
},'Email can not be blank');


UserSchema.path('email').validate(function(email,fn){
	const User = mongoose.model('User');
	if(this.skipValidation()) fn(true);

  // Check only when it is a new user or when email field is modified
  if(this.isNew || this.isModified('email')){
  	User.find({email: email}).exec(function(err,users){
  		fn(!err&&users.length === 0)
  	})
  } else fn(true);
}, 'Email already exists');

UserSchema.path('username').validate(function(username){
	if(this.skipValidation())return true;
	return username.length;
},'username can not be blank');

UserSchema.path('hashed_password').validate(function(hashed_password){
	if(this.skipValidation())return true;
	return hashed_password.length && this._password.length;
},'Password can not be blank');


UserSchema.pre('save', function(next){
	if(!this.isNew)return next();

	if(!validatePresenceOf(this.password)&&!this.skipValidation()){
		next(new Error('Invalid Password'));
	}else{
		next();
	}
});

 //user plugin

 //UserSchema.plugin(userPlugin, {});

 //add methods

 UserSchema.method({
 	authenticate: function(plainText){
 		return this.encryptPassword(plainText) === this.hashed_password;
 	},

 	makeSalt: function(){
 		return Math.round(new Date().valueOf()*Math.random()) + '';
 	},

 	encryptPassword: function(password){
 		if(!password)return '';
 		try{
 			return crypto
 				.createHmac('sha1', this.salt)
 				.update(password)
 				.digest('hex');
 		}catch(e){
 			return '';
 		}
 	},

 	//local or third party
 	skipValidation: function(){
 		return ~oAuthTypes.indexOf(this.provider);
 	}
 });

 //static

 UserSchema.static({
 	load: function(options, cb){
 		options.select = options.select || 'name username';
 		return this.findOne(options.criteria)
 			.select(options.select)
 			.exec(cb);
 	}
 });

 mongoose.model('User',UserSchema);