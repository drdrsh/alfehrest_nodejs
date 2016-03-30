
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
    });    function checkDatabase(db, config, force) {
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

}



function end(databaseSettings) {
    return new Promise(function(resolve, reject) {

        function handleError(err) {
            reject(err);
        }

        var db = (require('arangojs'))(databaseSettings.url);
        checkDatabase(db, databaseSettings, true)
            .then(dropDatabase, handleError)
            .then(function(){
                resolve();
            }, (err) => {
                reject(err);
            })
    });
}

function start(databaseSettings) {
    return new Promise(function(resolve, reject){

        function handleError(err) {
            reject(err);
        }

        var db = (require('arangojs'))(databaseSettings.url);
        checkDatabase(db, databaseSettings, true)
            .then(dropDatabase, handleError)
            .then(createDatabase, handleError)
            .then(createCollections, handleError)
            .then(createGraph, handleError)
            .then((db, config) => {
                return resolve();
            }, (err) => {
                reject(err);
            });
    });
}

module.exports = {
    build: start,
    destroy: end
};