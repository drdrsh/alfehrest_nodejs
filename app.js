'use strict';
var argv = require('./arguments.js');

var express        = require('express');
var bodyParser     = require('body-parser');
var fs             = require('fs');

if(!argv.appId) {
    console.log('Failed to load app');
    process.exit(1);
}
global.appId = argv.appId;

var app    = express();
var router = express.Router();

global.framework = require('./framework.js')(app, router, argv);


//Parsing Body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//OPTIONS request handling
app.use(function(req, res, next) {



    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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


app.use(framework.rootUrl, framework.router);
app.use(function(err, req, res, next){

    var errorObject = {
        'code'   : err.code,
        'message': err.message
    };

    /*
    var logDirectory = `./apps/${appId}/logs/`;
    let stream = require('file-stream-rotator').getStream({
        filename: require('path').join(logDirectory, 'server_error_%DATE%.log'),
        frequency: 'daily',
        verbose: true,
        date_format: 'YYYYMMDD'
    });
    let result = stream.write(err.stack);
    stream.end();
    */

    if(framework.env != 'production') {
        errorObject.stack = err.stack;
    }

    if(!framework.args['silent']) {
        console.error(err.stack);
    }

    if(!errorObject) {
        if(framework.env != 'production') {
            res.status(err.httpCode || 500).send(err.message);
        } else {
            res.status(err.httpCode || 500).send("Internal Server Error");
        }
    } else {
        res.status(err.httpCode || 500).send(errorObject);
    }

});

require('./controllers').load(app, router);

var selectedPort = argv.port || framework.port;
app.server = app.listen(selectedPort, function(){
    console.log(`${appId} Server started on port ${selectedPort} @ ${framework.rootUrl}`);
});

module.exports = app;