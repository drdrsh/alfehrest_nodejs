'use strict';

var PathHelper = {};

function constructPath(directory, entityName, core) {
    //TODO: Allow deeper paths
    var pathLib = require('path');
    var rootPath = pathLib.resolve(__dirname + "/../");
    if(typeof framework != "undefined") {
        rootPath = framework.rootPath;
    }
    if(!core) {
        rootPath = pathLib.resolve(rootPath + `/apps/${appId}/`);
    }
    var pathParts = [rootPath, directory];
    if(entityName && entityName != null){
        var nameLC = entityName.toLowerCase();
        if(!nameLC.endsWith(".js") && !nameLC.endsWith('.json')){
            entityName = "" + entityName + ".js";
        }
        pathParts.push(entityName);
    }
    return require("path").join.apply(null, pathParts);
}

PathHelper.libraries = function(entityName, core) {
    return constructPath("lib", entityName, core);
};

PathHelper.models = function(entityName, core) {
    return constructPath("models", entityName, core);
};

PathHelper.helpers = function(entityName, core) {
    return constructPath("helpers", entityName, core);
};

PathHelper.controllers = function(entityName, core) {
    return constructPath("controllers", entityName, core);
};

PathHelper.sessions = function(entityName) {
    return constructPath("users/sessions/", entityName);
};

PathHelper.profiles = function(entityName) {
    return constructPath("users/profiles/", entityName);
};


PathHelper.settings = function(entityName) {
    return constructPath("settings", entityName);
};

module.exports = PathHelper;
