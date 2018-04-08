

var path = require('path');
var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');

const notifier = {
	service: 'postmark',
	APN: false,
	email: true,
	actions: ['comments'],
	tplPath: path.join(__dirname, '..','app/mailer/templates'),
	key: 'POSTMAKE_KEY'
}

var defaults = {
  root: path.normalize(__dirname + '/..'),
  notifier: notifier
};



/**
 * Expose
 */

module.exports = {
  development: Object.assign({}, development, defaults),
  test: Object.assign({}, test, defaults),
  production: Object.assign({}, production, defaults)
}[process.env.NODE_ENV || 'development'];