'use strict';

module.exports.load = function(app, router){

    //Load app controllers
    require("fs").readdirSync(framework.helpers.path.controllers(null, false)).forEach(function (file) {
        if(file.substr(-3) == '.js') {
            framework.helpers.controller.load(file, false, app, router);
        }
    });

    //Load core controllers
    require("fs").readdirSync(framework.helpers.path.controllers(null, true)).forEach(function (file) {
        if(file.substr(-3) == '.js') {
            framework.helpers.controller.load(file, true, app, router);
        }
    });

};
