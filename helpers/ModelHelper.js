var ModelHelper = {};

var path = require("./PathHelper.js");

ModelHelper.get = function(e) {
    return require(path.models(e)).getInstance();
};

ModelHelper.getDatabase = function(){
    var dbSettings = framework.helpers.settings.get("database");
    var db = (require('arangojs'))(dbSettings.url);
    db.useDatabase(dbSettings.name);
    return db;
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

    for(var idx in obj.strings[activeLanguage]) {
        obj[idx] = obj.strings[activeLanguage][idx];
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
