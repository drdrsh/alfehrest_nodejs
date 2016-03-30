'use strict';

var ControllerHelper = {};
var path = require("./PathHelper.js");


ControllerHelper.load = function(entityName, core, app, router) {
    var controllerConstructor = require(path.controllers(entityName, core));
    return new controllerConstructor(app, router);
};

module.exports = ControllerHelper;
