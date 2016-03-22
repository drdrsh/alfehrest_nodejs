'use strict';

var ControllerHelper = {};
var path = require("./PathHelper.js");


ControllerHelper.load = function(entityName, app, router) {
    var controllerConstructor = require(path.controllers(entityName));
    return new controllerConstructor(app, router);
};

module.exports = ControllerHelper;
