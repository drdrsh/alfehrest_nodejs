'use strict';

var config = {
    "development": {
        "url"     : "http://127.0.0.1:8529",
        "username": "",
        "password": "",
        "name": "$$DB_NAME$$",
        "graph_name": "$$GRAPH_NAME$$",
        "entity_collection": "$$ENTITY_CNAME$$",
        "relation_collection": "$$REL_CNAME$$"
    },
    "production": {},
    "test": {}
};
config.production = config.test = config.development
module.exports = config;