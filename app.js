// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var bodyParser = require('body-parser');

var app        = express();                 // define our app using express

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(function(req, res, next){

    var lang = req.headers["content-language"];

    var supportedLanguages = alfehrest.helpers.settings.get('general').languages;
    if(supportedLanguages.indexOf(lang) == -1){
        res.sendStatus(400);
        return;
    }
    alfehrest.currentLanguage = lang;
    next();
});

app.use(function(req, res, next){
    req.app.errors = require("./errors.js").load(app);
    next();
});


//global['_'] = gettext.gettext;
global.alfehrest = {
    app: app,
    mainLanguage: 'ar',
    currentLanguage : 'ar',
    rootPath: require('path').resolve(__dirname),
    env: "dev",
    helpers: {
        path       : require("./helpers/PathHelper.js"),
        model      : require("./helpers/ModelHelper.js"),
        library    : require("./helpers/LibraryHelper.js"),
        controller : require("./helpers/ControllerHelper.js"),
        settings   : require("./helpers/SettingsHelper.js")
    }
};

app.use('/api', router);

require('./controllers').load(app, router);

// START THE SERVER
// =============================================================================
app.listen(port);

module.exports = app;

console.log('Magic happens on port ' + port);