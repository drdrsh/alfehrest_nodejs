
function checkDatabase(db, config, force) {
    db.useDatabase(config.name);
    return new Promise( function(resolve, reject) {
        db.get()
            .then(
                () => {
                    if(force) {
                        var db = (require('arangojs'))(config.url);
                        resolve([db, config]);
                    } else {
                        reject({
                            message: `Database ${config.name} already exists, use --force to overwrite it`
                        });
                    }
                },
                () => { resolve([db, config]); }
            );
    });

}
function dropDatabase(params) {
    var db = params[0];
    var config = params[1];
    console.log(`Dropping database ${config.name}`);
    return new Promise( function(resolve, reject) {
        db.dropDatabase(config.name)
            .then(
                () => { resolve([db, config]); },
                () => { resolve([db, config]); }
            );
    });
}

function createDatabase(params) {
    var db = params[0];
    var config = params[1];
    return new Promise( function(resolve, reject) {
        db.createDatabase(config.name)
            .then(
                () => {
                    console.log(`Created database ${config.name}`);
                    db.useDatabase(config.name);
                    resolve([db, config])
                },
                (err) => {
                    reject(err);
                }
            );
    });
}

function createCollections(params) {
    var db = params[0];
    var config = params[1];
    var promises = [];
    promises.push(db.collection(config.entity_collection).create());
    promises.push(db.edgeCollection(config.relation_collection).create());
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(
                () => {
                    console.log(`Created collections ${config.entity_collection} and  ${config.relation_collection}`);
                    resolve([db, config]);
                },
                (err) => {
                    reject(err);
                }
            );
    });
}

function createGraph(params) {
    var db = params[0];
    var config = params[1];
    return new Promise( function(resolve, reject) {
        db.graph(config.graph_name).create({
            'name': config.graph_name,
            'edgeDefinitions': [{
                to: [config.entity_collection],
                from: [config.entity_collection],
                collection: config.relation_collection
            }],
            'orphanCollections': []
        }).then(
            () => {
                console.log(`Created graph ${config.graph_name}`);
                resolve([db, config])
            },
            (err) => { reject(err) });
    });
}

function handleError(err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}

var argv = require('optimist').argv;
var databaseSettings = null;

var mode = 'test';
if(argv._[0]) {
    mode = argv._[0];
}

try {
    databaseSettings = require('./settings/database.js');
} catch(e) {
    console.error('Failed to load "settings/database.js", make sure the file exists');
    process.exit(1);
}

if(!(mode in databaseSettings)) {
    console.error(`Couldn't find database settings for environment "${mode}"`);
    process.exit(1);
}
databaseSettings = databaseSettings[mode];



var db = (require('arangojs'))(databaseSettings.url);

checkDatabase(db, databaseSettings, argv.force)
    .then(dropDatabase, handleError)
    .then(createDatabase, handleError)
    .then(createCollections, handleError)
    .then(createGraph, handleError)
    .then((db, config) => {
        console.log('Done!');
        process.exit(0);
    });




