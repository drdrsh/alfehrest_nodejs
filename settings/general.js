'use strict';

var config = {
    "development": {
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en'],
        "no_auth_routes" : ['post:/api/session/'],
        "max_session": 30
    },
    "production": {

    },
    "test" : {

    }
};
config.production = config.development;
config.test = config.development;
module.exports = config;