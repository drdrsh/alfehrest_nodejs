'use strict';

var fs = require('fs');

module.exports = function(app, router, argv) {

    var libPath = require('path');
    var settingsHelper = require("./helpers/SettingsHelper.js");
    var generalSettings = settingsHelper.get('general', null, argv['NODE_ENV']);
    var rootPath = libPath.resolve(__dirname);
    var f = {
        app: app,
        router: router,
        mainLanguage: generalSettings.mainLanguage,
        currentLanguage : generalSettings.mainLanguage,
        port: generalSettings.port,
        rootPath: rootPath,
        appPath:  libPath.resolve(__dirname + `/apps/${appId}/`),
        rootUrl : generalSettings.apiRoot,
        args: argv,
        env: argv['NODE_ENV'],
        error: require('./errors/AppError.js'),
        helpers: {
            path       : require("./helpers/PathHelper.js"),
            model      : require("./helpers/ModelHelper.js"),
            library    : require("./helpers/LibraryHelper.js"),
            controller : require("./helpers/ControllerHelper.js"),
            settings   : settingsHelper,
            session    : require("./helpers/SessionHelper.js")
        }
    };


    //Log file handling
    var logDirectory = `${rootPath}/apps/${appId}/logs/`;
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    /*
    app.use(morgan('combined', {
        stream: require('file-stream-rotator').getStream({
            filename: libPath.join(logDirectory, 'access_%DATE%.log'),
            frequency: 'daily',
            verbose: true,
            date_format: 'YYYYMMDD'
        })
    }));

    app.use(morgan('combined', {
        stream: require('file-stream-rotator').getStream({
            filename: libPath.join(logDirectory, 'error_%DATE%.log'),
            frequency: 'daily',
            verbose: true,
            date_format: 'YYYYMMDD'
        }),
        skip: function (req, res) {
            return res.statusCode < 400
        }
    }));
    */

    return f;
};