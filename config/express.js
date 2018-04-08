
/**
* Module depencies
*/

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var meethodOverride = require('method-override');
var csrf = require('csurf');

//new module
const cors = require('cors');
const upload = require('multer')();


var mongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var winston = require('winston');
var helpers = require('view-helpers');
var jade = require('jade');
var config = require('./');
var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

 module.exports = function(app, passport) {
 	// Compression middleware (should be placed before express.static)
 	app.use(compression({
 		threshold: 512
 	}));

 	app.use(cors({
 		origin: ['http://localhost:3000', 'https://reboil-demo.herokuapp.com'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
 	}));

 	//static files middleware
 	app.use(express.static(config.root + '/public'));

 	//use winstom on production
 	var log;
 	if(env !== 'development'){
 		log = {
 			stream: {
 				write: function (message, encoding){
 					winston.info(message);
 				}
 			}
 		}
 	}else{
 		log = 'dev';
 	}

 	if(env !== 'test') app.use(morgan(log));

 	//set views path and default layout
 	app.set('views',config.root + '/app/views');
 	app.set('view engine', 'jade');

 	// expose package.json to views
 	app.use(function(req,res,next){
 		res.locals.pkg = pkg;
 		res.locals.env = env;
 		next();
 	})

	app.use(bodyParser.json()); 	
 	app.use(bodyParser.urlencoded({extended: true}));
 	app.use(upload.single('image'));
 	app.use(meethodOverride(function(req,res){
 		if(req.body && typeof req.body === 'object' && '_method' in req.body){
 			var method = req.body._method;
 			delete req.body._method;
 			return method;
 		}
 	}))

 	app.use(cookieParser());
 	app.use(cookieParser({secret: 'secret'}));
 	app.use(session({
 		secret: pkg.name,
 		resave: false,
 		//proxy: true,
 		saveUninitialized: true,
 		store: new mongoStore({
 			url: config.db,
 			collections: 'sessions'
 		})
 	}));

 	app.use(passport.initialize());
 	app.use(passport.session());

 	app.use(flash());

 	app.use(helpers(pkg.name));


 	if(process.env.NODE_ENV !== 'test'){
 		app.use(csrf());

 		app.use(function(req,res,next){
 			res.locals.csrf_token = req.csrfToken();
 			next()
 		})
 	}

 	if(env === 'development'){
 		app.locals.pretty = true;
 	}

 }