var config = {
    "dev": {
        "entities" : ["event", "idol", "person", "place", "transcript", "tribe"],
        "languages": ['ar', 'en']
    },
    "production": {}
};
config.production = config.dev;
module.exports = config;