module.exports.load = function(app, router){
    var normalizedPath = require("path").join(framework.rootPath, "./controllers/");
    require("fs").readdirSync(framework.helpers.path.controllers()).forEach(function (file) {
        if(file.substr(-3) == '.js') {
            framework.helpers.controller.load(file, app, router);
        }
    });
};
