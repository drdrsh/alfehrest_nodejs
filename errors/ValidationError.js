var util = require('util');

function ValidationError(msg) {
    Error.call(this);
    this.name = 'ValidationError'; 
    this.message = msg;
    Error.captureStackTrace(this, this.constructor);
}

util.inherits(ValidationError, require('./AlFehrestError.js').AlFehrestError);

exports.ValidationError = ValidationError;