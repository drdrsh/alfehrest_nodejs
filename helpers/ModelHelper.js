'use strict';

var ModelHelper = {};

var path = require("./PathHelper.js");

ModelHelper.UID = function(entityType, id) {
    if(typeof id === 'undefined') {
        id = require('shortid').generate();
    }
    let hash = require('crypto').createHash('sha256').update(entityType + id).digest('hex').substr(0, 13);
    return `${entityType}_${hash}`;
};

ModelHelper.get = function(e, core) {
    return require(path.models(e, core)).getInstance();
};

ModelHelper.getDatabase = function(){
    var dbSettings = framework.helpers.settings.get("database");
    var db = (require('arangojs'))(dbSettings.url);
    db.useDatabase(dbSettings.name);
    return db;
};

ModelHelper.prepareEntityRecord = function(record, language) {

    var toRemove = ['_key', '_from', '_to', '_rev', '_id'];

    record.entity = ModelHelper.detranslateObject(record.entity, language);
    for(var j=0; j<toRemove.length; j++) {
        delete record.entity[toRemove[j]];
    }

    for (var idx in record.relationships) {
        var rels = [];
        for (var i = 0; i < record.relationships[idx].length; i++) {

            var e = record.relationships[idx][i]['entity'];
            var r = record.relationships[idx][i]['relationship'];

            r = ModelHelper.detranslateObject(r, language);
            if(e) {
                e = ModelHelper.detranslateObject(e, language);
                e['id'] = e['_key'];
                r['entity'] = e;
            }
            r['id'] = r['_key'];
            
            for(var j=0; j<toRemove.length; j++) {
                if(e) {
                    delete e[toRemove[j]];
                }
                delete r[toRemove[j]];
            }
            rels.push(r);
        }
        record.relationships[idx] = rels;
    }
    return record;
};

ModelHelper.detranslateObject= function(obj, language) {
    //Move strings from strings array to the root object
    //If language is not available e.g, object not translated in that language yet, we use the main lang as template
    //If the main language isn't available then we an error
    var activeLanguage = language;
    var missingLanguage = false;

    if(!obj.strings) {
        return obj;
    }

    if(!activeLanguage in obj.strings) {
        missingLanguage = true;
        if(! framework.mainLanguage in obj.strings) {
            throw framework.error(1, 500, 'Failed to load strings!');
        }
        activeLanguage = framework.mainLanguage
    }

    for(let idx in obj.strings[activeLanguage]) {
        let str = obj.strings[activeLanguage][idx];
        if(Array.isArray(str)) {
            if(Array.isArray(obj[idx])) {
                for(let x=0; x<obj[idx].length; x++) {
                    Object.assign(obj[idx][x], str[x]);
                }
                continue;
            }
        }
        obj[idx] = str;

    }
    delete obj.strings;

    return obj;
};

ModelHelper.cleanForm = function(schema, language, inputs, update){

    var ref = schema;
    var newObject = {
        strings: {}
    };
    newObject.strings[language] = {};

    for(var idx in ref) {

        var field = ref[idx];
        var missingValue = !(idx in inputs);

        if(missingValue && !update && field.required) {
            throw framework.error(1, 400, `Missing required field ${idx}`);
        }

        var value = field.default;
        if(!missingValue) {
            value = inputs[idx];
        }

        if(typeof field.validation == "function" && !missingValue) {
            //Throws an exception on error;
            field.validation(idx, value, inputs);
        }

        if(field.translatable) {
            newObject.strings[language][idx] = value;
        } else {
            newObject[idx] = value;
        }
    }
    return newObject;

};

ModelHelper.executeQueries = function(queries) {
    return new Promise(function(resolve, reject){
        var db = ModelHelper.getDatabase();
        var dbSettings = framework.helpers.settings.get("database");

        var action = String(function () {
            var db = require('org/arangodb').db;
            //#Q#//
            for(var i=0; i<queries.length; i++) {
                db._query(queries[i]);
            }
        });
        action = action.replace("//#Q#//", "var queries=" + JSON.stringify(queries) + ";");
        db.transaction({write: [dbSettings.entity_collection, dbSettings.relation_collection]}, action)
            .then(
                result => { resolve(); },
                err => { reject(framework.error(err)); }
            );

    });
};

ModelHelper.executeQuery = function(query){
    return new Promise(function(resolve, reject) {
        ModelHelper.getDatabase().query(query)
            .then(
                () => { resolve(); },
                err => { reject(framework.error(err)); }
            );
    });
};

ModelHelper.getOneRecord = function(query){
    return new Promise(function(resolve, reject) {
        ModelHelper.getDatabase().query(query)
            .then(
                cursor => {
                    cursor.all().then(
                        records => {
                            var record = (records.length==0)?null:records[0];
                            resolve(record);
                        },
                        err => { reject(framework.error(err)); }
                    )
                },
                err => { reject(framework.error(err)); }
            );
    });
};

ModelHelper.getAllRecords = function(query){
    return new Promise(function(resolve, reject) {
        ModelHelper.getDatabase().query(query)
            .then(
                cursor => {
                    cursor.all().then(
                        records => { resolve(records); },
                        err => { reject(framework.error(err)); }
                    )
                },
                err => { reject(framework.error(err)) }
            );
    });
};

module.exports = ModelHelper;
