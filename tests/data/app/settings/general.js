'use strict';

var config = {
    "development": {
        "id"       : '$$APP_NAME$$',
        "port"     :  6666,
        "entities" : ["person1", "person2", "person3"],
        "languages": ['ar'],
        "apiRoot" : "$$API_ROOT$$",
        "no_auth_routes" : [
            'post:/session/.*',
            'get:/person1/.*',
            'get:/person2/.*'
        ],
        "max_session": 30
    },
    "production": {},
    "test" : {}
};
config.production = config.test = config.development;
module.exports = config;