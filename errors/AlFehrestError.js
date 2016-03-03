var util = require('util');

function AlFehrestError(msg) {
    Error.call(this);
    this.name = errorName;
    this.message = msg;
    Error.captureStackTrace(this, this.constructor);
}

util.inherits(AlFehrestError, Error);

exports.AlFehrestError = AlFehrestError;