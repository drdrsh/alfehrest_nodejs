'use strict';

var config = {
    "development": {
        "id"       : '$$APP_NAME$$',
        "port"     :  6666,
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en'],
        "apiRoot" : "$$API_ROOT$$",
        "no_auth_routes" : [
            'post:/session/.*',
            'get:/person/.*',
            'get:/event/.*',
            'get:/place/.*',
            'get:/idol/.*',
            'get:/transcript/.*',
            'get:/tribe/.*'
        ],
        "max_session": 30
    },
    "production": {
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en'],
        "port"     : 9080,
        "apiRoot"  : "/seera",
        "no_auth_routes" : [
            'post:/session/.*',
            'get:/person/.*',
            'get:/event/.*',
            'get:/place/.*',
            'get:/idol/.*',
            'get:/transcript/.*',
            'get:/tribe/.*'
        ],
        "max_session": 30
    },
    "test" : {

    }
};
config.test = config.development;
module.exports = config;