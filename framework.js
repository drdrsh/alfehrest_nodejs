'use strict';

module.exports = function(app, router, argv) {
    
    var settingsHelper = require("./helpers/SettingsHelper.js");
    var generalSettings = settingsHelper.get('general', null, argv['NODE_ENV']);

    return {
        app: app,
        router: router,
        mainLanguage: generalSettings.mainLanguage,
        currentLanguage : generalSettings.mainLanguage,
        rootPath: require('path').resolve(__dirname),
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
};