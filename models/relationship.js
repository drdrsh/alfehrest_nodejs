var uniqueIdGenerator = require('shortid');

var cfg = framework.helpers.settings.get("database");
var modelHelper = framework.helpers.model;
var db = modelHelper.getDatabase();
var instance;

function prepareRelationshipData(language, parentId, data, isUpdate) {

    var firstEntityId = parentId;
    var firstEntityType = parentId.split('_').shift();
    var entityModel = modelHelper.get(firstEntityType);
    var relationshipSchema = entityModel.getRelationshipSchema();
    var eCol = cfg.entity_collection;
    var rCol = cfg.relation_collection;

    if(!Array.isArray(data)){
        data = [data];
    }

    var records = [];
    for(var i=0;i<data.length;i++) {

        var relItem = data[i];
        var secondEntityId = relItem.secondEntityId;
        var secondEntityType = secondEntityId.split("_").shift();
        var relationshipType = relItem.type;

        if(!isUpdate) {
            delete relItem.id;
        }

        // Query all persons and whether we follow each one or not:
        if (firstEntityId == secondEntityId) {
            //Cannot have circular relations
        }

        var relationshipSubtype = relationshipType.split('.').pop();
        //Look for relationship schema that matches this kind of relationship
        var relationshipFields = {};
        try {
            relationshipFields = relationshipSchema[secondEntityType][relationshipSubtype].fields;
        } catch(e) {
            throw framework.error(1, 400, "Unsupported relationship type");
        }

        //Validate and restructure the incoming data
        var relationshipProperties = modelHelper.cleanForm(relationshipFields, language, relItem);

        relationshipProperties.firstEntityId = firstEntityId;
        relationshipProperties.secondEntityId= secondEntityId;
        relationshipProperties.firstEntityType = firstEntityType;
        relationshipProperties.secondEntityType= secondEntityType;
        relationshipProperties.relationship = relationshipSubtype;

        if(!isUpdate) {
            relationshipProperties._key = "rel_" + uniqueIdGenerator.generate();
        } else {
            relationshipProperties._key = relationshipProperties.id;
        }
        relationshipProperties._from = `${eCol}/${firstEntityId}`;
        relationshipProperties._to = `${eCol}/${secondEntityId}`;

        records.push(relationshipProperties);
    }
    return records;
}

function create(language, parentId, data) {

    var records = null;

    try {
        records = JSON.stringify(prepareRelationshipData(language, parentId, data, false));
    } catch(e) {
        Promise.reject(e);
    }
    var rCol = cfg.relation_collection;

    var query = `LET records = ${records}
    FOR record IN records
    INSERT record in ${rCol}`;

    return modelHelper.executeQuery(query);

}

function updateCurrentRelationships(language, entityId, incomingRelationships, currentRelationships) {

    var rCol = cfg.relation_collection;
    var eCol = cfg.entity_collection;

    var insertions = [];
    var updates = [];
    var deletions = [];

    var relationshipKeys = {};
    for(let i=0; i<currentRelationships.length; i++) {
        var rel = currentRelationships[i];
        relationshipKeys[rel['_key']] = false;
    }

    for(let i=0; i<incomingRelationships.length; i++) {
        var rel = incomingRelationships[i];
        if(rel['id'] != '' ) {
            if(!rel['id'] in relationshipKeys) {
                deferred.reject();
                return;
            }
            relationshipKeys[rel['id']] = true;
            updates.push(rel);
            continue;
        }
        insertions.push(rel);
    }

    for(var idx in relationshipKeys){
        if(! relationshipKeys[idx]){
            deletions.push(idx);
        }
    }

    try {
        insertions = JSON.stringify(prepareRelationshipData(language, entityId, insertions, false));
        updates = JSON.stringify(prepareRelationshipData(language, entityId, updates, true));
        deletions = JSON.stringify(deletions);
    } catch (e) {
        return Promise.reject(e);
    }

    var queries = [];
    queries.push(`
            LET insertions = ${insertions}
            FOR record_1 IN insertions
            INSERT record_1 IN ${rCol}
            `);

    queries.push(`
            LET updates = ${updates}
                FOR record_2 IN updates
                    UPDATE record_2._key WITH record_2 IN ${rCol}
            `)

    queries.push(`
            LET deletions = ${deletions}
            FOR id IN deletions
                REMOVE id IN ${rCol}`
    );

    return modelHelper.executeQueries(queries);
}

function update(language, entityId, incomingRelationships) {

    var that = this;
    return new Promise(function (resolve, reject) {
        that.getAll(language, entityId)
            .then(
                currentRelationships => {
                    updateCurrentRelationships(language, entityId, incomingRelationships, currentRelationships)
                    .then(
                        () => {resolve(); },
                        err => { reject(err); }
                    );
                },
                err => { reject(err); }
            );
    });
}

function getAll(language, entityId) {

    var rCol = cfg.relation_collection;
    var eCol = cfg.entity_collection;
    var fqnEntityId = eCol + '/' + entityId;

    var query =
        `FOR r IN ${rCol}
            FILTER r._from == '${fqnEntityId}'
        RETURN r`;

    return new Promise(function(resolve, reject){
        modelHelper.getAllRecords(query)
        .then(
            records => {
                try {
                    for (var i = 0; i < records.length; i++) {
                        records[i] = modelHelper.detranslateObject(records[i]);
                    }
                } catch(e) {
                    return reject(e);
                }
                resolve(records);
            },
            err => { reject(err); }
        )
    });
}



function RelationshipModel() {
    this.create = create;
    this.update = update;
    this.getAll = getAll
}

module.exports = {
    getInstance: function() {
        return instance || (instance = new RelationshipModel());
    }
};