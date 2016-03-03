module.exports.load = function(app){
    var errorsObject = {};
    var normalizedPath = require("path").join(__dirname, "./errors/");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        if(file.substr(-3) != '.js') {
            return;
        }
        var err = require("./errors/" + file);
        for(var idx in err){
            errorsObject[idx] = err[idx];
        }
    });
    return errorsObject;
}