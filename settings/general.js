'use strict';

var config = {
    "development": {
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en'],
        "apiRoot" : "/api",
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
        "apiRoot" : "/nodejs",
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