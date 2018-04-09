

'use strict'
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

 exports.user = {
 	hasAuthorization: function(req,res,next){
 		if(req.profile.user.id != req.user.id){ //not authorization
 			req.flash('info','You are not authorized!');
 			return res.redirect('/users/'+req.profile.id);
 		}
 		next();
 	}
 }

/*
 *  Article authorization routing middleware
 */

 exports.article = {
 	hasAuthorization: function(req,res,next){
 		console.log(req.article.id, req.user.id);
 		if(req.article.user.id != req.user.id){
 			req.flash('info','You are not authorized!');
 			return res.redirect('/articles/'+req.article.id);
 		}
 		next();
 	}
 }

/**
 * Comment authorization routing middleware
 */

  exports.comment = {
 		hasAuthorization: function(req,res,next){
 			if(req.user.id === req.comment.user.id || req.user.id === req.article.user.id){
 				next();
 			}else{
 				req.flash('info','You are not authorized!');
 				res.redirect('/articles/'+req.article.id);
 			}
 			
 		}
 }