module.exports.load = function(app, router){
    var normalizedPath = require("path").join(alfehrest.rootPath, "./controllers/");
    require("fs").readdirSync(alfehrest.helpers.path.controllers()).forEach(function (file) {
        if(file.substr(-3) == '.js') {
            alfehrest.helpers.controller.load(file, app, router);
        }
    });
};
