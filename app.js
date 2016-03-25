'use strict';

var argv = require('./arguments.js');
argv.silent = false;
var express    = require('express');
var bodyParser = require('body-parser');
var fs         = require('fs');
var morgan     = require('morgan');

var app    = express();
var router = express.Router();

global.framework = require('./framework.js')(app, router, argv);

//Log file handling
var logDirectory = __dirname + '/log';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'});
var errorLogStream = fs.createWriteStream(logDirectory + '/error.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('combined', {stream: errorLogStream, skip: function (req, res) { return res.statusCode < 400 }}));

//Parsing Body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//OPTIONS request handling
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

//Authentication handling
app.use(function(req, res, next) {

    var sessionHelper = framework.helpers.session;

    //Route doesn't require authentication
    if(!sessionHelper.requestRequiresAuthentication(req)) {
        //proceed
        //TODO: Check for API keys
        return next();
    }

    if(!sessionHelper.isLoggedIn(req)) {
        return next(framework.error(1, 401, 'Unauthorized'));
    }

    next();
});


//Request Language handling
app.use(function(req, res, next){

    var lang = req.headers["content-language"];

    var supportedLanguages = framework.helpers.settings.get('general').languages;
    if(supportedLanguages.indexOf(lang) == -1) {
        return next(framework.error(1, 400, 'Invalid language code'));
    }
    framework.currentLanguage = lang;
    next();
    
});


app.use(global.framework.rootUrl, router);
app.use(function(err, req, res, next){

    var nodeErrorLogStream = fs.createWriteStream(logDirectory + '/server-error.log', {flags: 'a'});
    var errorObject = {
        'code'   : err.code,
        'message': err.message
    };

    nodeErrorLogStream.write(err.stack);

    if(framework.env != 'production') {
        errorObject.stack = err.stack;
    }

    if(!framework.args['silent']) {
        console.error(err.stack);
    }


    res.status(err.httpCode).send(errorObject);
});

require('./controllers').load(app, router);

app.server = app.listen(argv['port']);
module.exports = app;

if(!framework.args['silent']) {
    console.log(`AlFehrest Server started on port ${argv.port}`);
}