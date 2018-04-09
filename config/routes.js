'use strict';

/**
 * Module dependencies.
 */

const home = require('../app/controllers/home');

const articles = require('../app/controllers/articles');
const users = require('../app/controllers/users');
const tags = require('../app/controllers/tags');


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

  //params
  app.param('userId', users.load);

  //get methods
  app.get('/login', users.login);
  app.get('/signup',users.signup);
  app.get('/logout',users.logout);
  app.get('/users/:userId',users.show);

  //post methods
  app.post('/users',users.create);
  app.post('/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session );

  
  app.param('id',articles.load);

  //article route
  app.get('/',articles.index);
  app.get('/articles/new',articles.new);
  app.get('/articles/:id',articles.show);
  app.get('/articles/:id/edit', articleAuth, articles.edit);
  app.get('/articles', articles.index);
  //post article
  app.post('/articles', articles.create);
  app.put('/articles/:id', articleAuth, articles.update);
  app.delete('/articles/:id', articleAuth, articles.destroy);

  //tags route
  app.get('/tags/:tag',tags.index);
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
