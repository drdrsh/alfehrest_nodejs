'use strict';

module.exports = function(app, argv) {
    return {
        app: app,
        mainLanguage: 'ar',
        currentLanguage : 'ar',
        rootPath: require('path').resolve(__dirname),
        args: argv,
        env: argv['NODE_ENV'],
        error: require('./errors/AppError.js'),
        helpers: {
            path       : require("./helpers/PathHelper.js"),
            model      : require("./helpers/ModelHelper.js"),
            library    : require("./helpers/LibraryHelper.js"),
            controller : require("./helpers/ControllerHelper.js"),
            settings   : require("./helpers/SettingsHelper.js"),
            session    : require("./helpers/SessionHelper.js")
        }
    };
};