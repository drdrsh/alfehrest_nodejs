var express    = require('express');
var bodyParser = require('body-parser');
var fs         = require('fs');
var morgan     = require('morgan');

var app    = express();
var router = express.Router();

global.framework = {
    app: app,
    mainLanguage: 'ar',
    currentLanguage : 'ar',
    rootPath: require('path').resolve(__dirname),
    env: "dev",
    error: require('./errors/AppError.js'),
    helpers: {
        path       : require("./helpers/PathHelper.js"),
        model      : require("./helpers/ModelHelper.js"),
        library    : require("./helpers/LibraryHelper.js"),
        controller : require("./helpers/ControllerHelper.js"),
        settings   : require("./helpers/SettingsHelper.js")
    }
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

var logDirectory = __dirname + '/log';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'});
var errorLogStream = fs.createWriteStream(logDirectory + '/error.log', {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('combined', {stream: errorLogStream, skip: function (req, res) { return res.statusCode < 400 }}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
app.use(function(req, res, next){

    var lang = req.headers["content-language"];

    var supportedLanguages = framework.helpers.settings.get('general').languages;
    if(supportedLanguages.indexOf(lang) == -1) {
        return next(framework.error(1, 400, 'Invalid language code'));
    }
    framework.currentLanguage = lang;
    next();
});
app.use('/api', router);
app.use(function(err, req, res, next){

    var errorObject = {
        'code'   : err.code,
        'message': err.message
    };

    if(global.framework.env == 'dev') {
        errorObject.stack = err.stack;
    }
    console.error(errorObject.stack);

    res.status(err.httpCode).send(errorObject);
});

require('./controllers').load(app, router);

var port = process.env.PORT || 8080;

app.server = app.listen(port);
module.exports = app;

console.log('Magic happens on port ' + port);