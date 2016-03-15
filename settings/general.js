var config = {
    "development": {
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en']
    },
    "production": {

    },
    "test" : {

    }
};
config.production = config.development;
config.test = config.development;
module.exports = config;