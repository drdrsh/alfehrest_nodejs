'use strict';

var argv = require('optimist').argv;
var databaseSettings = null;
var mode = 'test';
var attempts = 0;

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
                            code: 'ALREADY_EXISTS',
                            message: `Database ${config.name} already exists, use --force to overwrite it`
                        });
                    }
                },
                (err) => {
                    if(err.code == 'ECONNREFUSED') {
                        return reject({
                            code: 'CONNECTION_REFUSED',
                            message: `Failed to connect to database server`
                        });
                    }
                    resolve([db, config]);
                }
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
    var config = params[1];
    var db = (require('arangojs'))(config.url);
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
    throw(err);
}


if(argv._[0]) {
    mode = argv._[0];
}

const NUMBER_OF_ATTEMPTS = parseInt(argv.attempts, 10) || 10;
const ATTEMPT_WAIT = parseInt(argv.wait, 10) || 5000;

if(isNaN(NUMBER_OF_ATTEMPTS) || NUMBER_OF_ATTEMPTS <= 0) {
    console.error('Invalid number of attempts');
    process.exit(1);
}

if(isNaN(ATTEMPT_WAIT) || ATTEMPT_WAIT <= 0) {
    console.error('Invalid waiting time');
    process.exit(1);
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




function attemptConnection() {
    var db = (require('arangojs'))(databaseSettings.url);
    checkDatabase(db, databaseSettings, argv.force)
        .then(dropDatabase, handleError)
        .then(createDatabase, handleError)
        .then(createCollections, handleError)
        .then(createGraph, handleError)
        .then((db, config) => {
            console.log('Done!');
            process.exit(0);
        }, (err) => {
            if(err.code === 'CONNECTION_REFUSED' && attempts < NUMBER_OF_ATTEMPTS) {
                attempts++;
                console.log(`Connection refused, retrying in ${ATTEMPT_WAIT/1000} seconds (${attempts} out of ${NUMBER_OF_ATTEMPTS})`);
                setTimeout(attemptConnection, ATTEMPT_WAIT);

            } else {
                console.error(`Error: ${err.message}`);
                process.exit(1);
            }
        });
}

attemptConnection();