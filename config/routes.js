'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');

const articles = require('../app/controllers/articles');
const users = require('../app/controllers/users');

const auth = require('./middlewares/authorization');



const articleAuth = [auth.requiresLogin,auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'

}
/**
 * Expose
 */

module.exports = function (app, passport) {

  //app.get('/', home.index);
  const pauth = passport.authenticate.bind(passport);

  app.get('/login', users.login);
  app.get('/signup',users.signup);

  app.post('/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session );

  app.post('/users',users.create);


  //home route
  app.get('/',home.index);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    if(err.stack.includes('ValidationError')){
      res.status(422).render('422', { error: err.stack });
      return;
    }

    res.status(500).render('500',{error: err.stack});
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    }
    if(req.accepts('json'))return res.status(404).json(payload);
    res.status(404).render('404',payload);
  });
};
