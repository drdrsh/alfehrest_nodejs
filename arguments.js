'use strict';
var fs   = require('fs');
var path = require('path'); 
var validatedArgs = {};
var argv = require('optimist').argv;

var validArgs = {
    'appId': {
        def: null,
        valid : v => {
            try {
                let fn = path.resolve(__dirname + `/apps/${v}/settings/general.js`);
                let res = fs.statSync(fn);
                return true;
            } catch (e) {
                return false;
            }
        },
       process: v => { return v; }
    },
    'NODE_ENV' : {
        def: 'development',
        valid: v => { return ['development', 'production', 'test'].indexOf(v) != -1; },
        process: v => { return v; }
    },
    'port' : {
        def: null,
        valid: v => { v = parseInt(v, 10); return Number.isInteger(v) && (v > 0 && v < 65535); },
        process: v => { return parseInt(v, 10); }
    },
    'silent' : {
        def: false,
        valid: v => { return true },
        process: v => {
            if(v === '0' || v === 'false'){
                return false;
            }
            return true;
        }
    }
};

//Read params, give precedence to process.env -> argv -> defaults
for(let idx in validArgs) {
    var param = validArgs[idx];

    if(param.valid(process.env[idx])) {
        validatedArgs[idx] = param.process(process.env[idx]);
        continue;
    }

    if(param.valid(argv[idx])) {
        validatedArgs[idx] = param.process(argv[idx]);
        continue;
    }

    validatedArgs[idx] = param.def;
}

module.exports = validatedArgs;