
const mongoose = require('mongoose');
const {wrap: async} = require('co');
const {respond} = require('../utils');
const User = mongoose.model('User');

exports.load = async(function* (req,res,next,_id){
	const criteria = { _id };
	try {
		req.profile = yield User.load({criteria});
		if(!req.profile)return next(new Error('User not found'));
		return next();
	} catch(err) {
		next(err);
	}
})

exports.create = async(function* (req,res){
	const user = new User(req.body);

	console.log(req.body);

	user.provider = 'local';
	try{
		yield user.save();
		req.logIn(user, err => {
			if(err)req.flash('info','Sorry! We are not able to log you in!');
			return res.redirect('/');
		})
	}catch(err){
		const errors = Object.keys(err.errors)
			.map(field => err.errors[field].message );
		res.render('users/signup',{
			title: 'Sign up',
			errors,
			user
		})
	}
})

exports.show = function(req,res){
	const user = req.profile;
	respond(res,'users/show',{
		title: user.name,
		user:user
	})
}

exports.signin = function(){}

exports.authCallback = login;

exports.login = function(req,res){
	res.render('users/login',{title: 'Login'})
}

exports.signup = function(req,res){
	res.render('users/signup',{
		title:'Sign up',
		user: new User()
	})
}

exports.logout = function(req,res){
	req.logout();
	res.redirect('/login');
}

//session
exports.session = login;

function login (req, res) {
  const redirectTo = req.session.returnTo
    ? req.session.returnTo
    : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}