// set up
// get all the tools we need
var express = require('express');
var app = express();
var multer = require('multer');
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var mailer = require('express-mailer');
var favicon = require('serve-favicon');
var path = require('path');
var helmet = require('helmet');
var expressValidator = require('express-validator');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var MongoStore = require('connect-mongo')(session);
var passportSocketIo = require('passport.socketio');
var csrf = require('csurf');

require('./config/passport')(passport); // pass passport for configuration
require('./config/mailer')(app, mailer) // pass mailer for configuration


app.set('views', path.join(__dirname, '/views/'));

// configure database
mongoose.connect(configDB.url); // connect to our database

// set up our express application

// add helmet middlewares
app.use(helmet.frameguard()) // defend against clickJacking
app.use(helmet.noSniff());
app.use(helmet.xssFilter()); // some basic protection against XSS
app.use(helmet.dnsPrefetchControl()); // DNS prefetching by the browser in check

app.use(expressValidator({
	customValidators: {
		isTheme: function(value) {
			return ((value == "#FF003D") || (value == "#9C27B0") || (value ==
				"#F44336") || (value == "#FF5722") || (value == "#3B7B3B"));
		},
		isGender: function(value) {
			return ((value == "Male") || (value == "Female") || (value == "Other"));
		},
		isAge: function(value) {
			return ((value >= 0));
		}
	}
}));

app.set('trust proxy', 1);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(favicon('./public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));

var sessionStore = new MongoStore({
	url: configDB.url
}); // SESSION STORE

// required for passport
app.use(session({
	secret: 'chessPlus',
	key: 'express.sid',
	store: sessionStore,
	resave: true,
	saveUninitialized: false
})); // session secret

//With Socket.io >= 1.0
io.use(passportSocketIo.authorize({
	passport: passport,
	cookieParser: cookieParser, // the same middleware you registrer in express
	key: 'express.sid', // the name of the cookie where express/connect stores its session_id
	secret: 'chessPlus', // the session_secret to parse the cookie
	store: sessionStore, // we NEED to use a sessionstore. no memorystore please
	success: onAuthorizeSuccess, // *optional* callback on success - read more below
	fail: onAuthorizeFail // *optional* callback on fail/error - read more below
}));

require('./app/live')(io);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname));

var csrfExclusion = ['/profile', '/profile#', '/updatePicture'];

app.use(function(req, res, next) {
	if (csrfExclusion.indexOf(req.path) !== -1) {
		next();
	} else {
		csrf()(req, res, next);
	}
});

app.use(function(err, req, res, next) {
	if (err.code !== 'EBADCSRFTOKEN') return next(err)

	// handle CSRF token errors here
	res.status(403)
	res.send('form tampered with or session has expired..!!')
})

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		if (!file.mimetype.match(/(jpg|jpeg)$/)) {
			console.log(file.mimetype);
			return callback(new Error('Only image files are allowed!'));
		}
		callback(null, req.user.username + '.jpg');
	}
});

var upload = multer({
	storage: storage,
	limits: {
		fileSize: 1000000
	},
	fileFilter: function(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
			return cb(new Error('Only image files are allowed!'));
		}
		cb(null, true);
	}
}).single('profilePicture');


function onAuthorizeSuccess(data, accept) {
	console.log('successful connection to socket.io');
	// The accept-callback still allows us to decide whether to
	// accept the connection or not.
	console.log('auth successful !!');
	// If you use socket.io@1.X the callback looks different
	accept();
}

function onAuthorizeFail(data, message, error, accept) {
	if (error) throw new Error(message);
	return accept();
}

// routes ======================================================================
require('./app/routes.js')(app, passport, upload); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
server.listen(port);
console.log('The magic happens on port ' + port);
