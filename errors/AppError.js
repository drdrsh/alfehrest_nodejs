var util = require('util');

function AppError(opts) {
    Error.call(this);
    var options = {
        'code': -1,
        'httpCode': 500,
        'message': 'Unknown error'
    };

    Object.assign(options, opts);

    this.code = options.code;
    this.httpCode = options.httpCode;
    this.message = options.message;
    Error.captureStackTrace(this, this.constructor);
}

util.inherits(AppError, Error);

var gen = function(code, httpCode, message) {
    return new AppError({
        'code' : code,
        'httpCode' : httpCode,
        'message' : message
    });
};

module.exports = function() {
    //Sending single object as input means we have a database error
    if(arguments.length == 1 && arguments[0] !== null && typeof arguments[0] == 'object') {
        var err = arguments[0];
         return gen(950, 500, `DatabaseError: ${err.message}`);
    } else {
        return gen(arguments[0], arguments[1], arguments[2]);
    }
};