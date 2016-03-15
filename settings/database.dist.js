var config = {
    "development": {
        "url"     : "",
        "username": "",
        "password": "",
        "name": "",
        "graph_name": "",
        "entity_collection": "",
        "relation_collection": ""
    },
    "production": {

    },
    "test": {

    }
};
config.production = config.development;
config.test = config.development;
module.exports = config;