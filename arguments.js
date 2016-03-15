var validatedArgs = {};
var argv = require('optimist').argv;

var validArgs = {
    'NODE_ENV' : {
        def: 'development',
        valid: v => { return ['development', 'production', 'test'].indexOf(v) != -1; }
    },
    'port' : {
        def: '8080',
        valid: v => { v = parseInt(v, 10); return Number.isInteger(v) && (v > 0 && v < 65535); }
    }
};

//Read params, give precedence to process.env -> argv -> defaults
for(let idx in validArgs) {
    var param = validArgs[idx];

    if(process.env[idx] && param.valid(process.env[idx])) {
        validatedArgs[idx] = process.env[idx];
        continue;
    }

    if(argv[idx] && param.valid(argv[idx])) {
        validatedArgs[idx] = argv[idx];
        continue;
    }

    validatedArgs[idx] = param.def;
}

module.exports = validatedArgs;