var ModelHelper = {};

var q = require('q');
var path = require("./PathHelper.js");

ModelHelper.get = function(entityName) {
    var entityName = entityName.charAt(0).toUpperCase() + entityName.substr(1);
    return require(path.models(entityName)).getInstance();
};

ModelHelper.getDatabase = function(){

    var dbSettings = alfehrest.helpers.settings.get("database");
    var db = (require('arangojs'))(dbSettings.url);
    db.useDatabase(dbSettings.name);
    return db;

};

ModelHelper.detranslateObject= function(obj, language) {
    //Move strings from strings array to the root object
    //If language is not available e.g, object not translated in that language yet, we use the main lang as template
    //If the main language isn't available then we an error
    var activeLanguage = language
    var missingLanguage = false;
    if(!activeLanguage in obj.strings) {
        missingLanguage = true;
        if(! alfehrest.mainLanguage in obj.strings){
            throw new Error("Failed to load strings!");
        }
        activeLanguage = alfehrest.mainLanguage
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
            throw new Error("Missing required field " + idx);
        }

        var value = field.default;
        if(!missingValue) {
            value = inputs[idx];
        }

        if(typeof field.validation == "function" && !missingValue) {
            //Throws an exception on error;
            field.validation(value, inputs);
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
    var deferred = q.defer();

    var db = this.getDatabase();
    var dbSettings = alfehrest.helpers.settings.get("database");

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
            result => { deferred.resolve() },
            () => { deferred.reject() }
         );

    return deferred.promise;
};

ModelHelper.executeQuery = function(query){
    var deferred = q.defer();

    this.getDatabase().query(query)
        .then(
        ()  => {deferred.resolve()},
        () => {deferred.reject()}
    );
    return deferred.promise;
};

ModelHelper.getOneRecord = function(query){
    var deferred = q.defer();

    this.getDatabase().query(query)
        .then(
            cursor => {
            cursor.all().then(
                    records => {
                    var record = (records.length==0)?null:records[0];
                    deferred.resolve(record);
                }
            )
        },
        () => {
            deferred.reject()
        }
    );

    return deferred.promise;
};

ModelHelper.getAllRecords = function(query){

    var deferred = q.defer();

    this.getDatabase().query(query)
        .then(
            cursor => {
            cursor.all().then(
                    records => {
                    deferred.resolve(records);
                }
            )
        },
        () => {
            deferred.reject()
        }
    );

    return deferred.promise

};

module.exports = ModelHelper;
