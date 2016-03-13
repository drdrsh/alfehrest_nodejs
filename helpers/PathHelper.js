var PathHelper = {};

function constructPath(directory, entityName) {
    //TODO: Allow deeper paths
    var pathParts = [framework.rootPath, directory];
    if(entityName && entityName != null){
        if(!entityName.toLowerCase().endsWith(".js")){
            entityName = "" + entityName + ".js";
        }
        pathParts.push(entityName);
    }
    return require("path").join.apply(null, pathParts);
}

PathHelper.libraries = function(entityName) {
    return constructPath("lib", entityName);
};

PathHelper.models = function(entityName) {
    return constructPath("models", entityName);
};

PathHelper.helpers = function(entityName) {
    return constructPath("helpers", entityName);
};

PathHelper.controllers = function(entityName) {
    return constructPath("controllers", entityName);
};

PathHelper.settings = function(entityName) {
    return constructPath("settings", entityName);
};

module.exports = PathHelper;
