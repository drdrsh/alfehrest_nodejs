var LibraryHelper = {};
var path = require("./PathHelper.js");


LibraryHelper.getInstance = function(name) {

    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(alfehrest.app);

    var constructor = require(path.libraries(name));
    return new (Function.prototype.bind.apply(constructor, args, args));
};

module.exports = LibraryHelper;