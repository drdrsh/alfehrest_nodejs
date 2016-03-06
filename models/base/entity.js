var q = require('q');
var uniqueIdGenerator = require('shortid');

var cfg = alfehrest.helpers.settings.get("database");
var modelHelper = alfehrest.helpers.model;
var db = modelHelper.getDatabase();

function create(language, props) {

    var deferred = q.defer();
    var className = this.getEntityName().toLowerCase();

    //TODO : should double check if random id already exists
    props.id   = this.getEntityName() + "_" + uniqueIdGenerator.generate();
    props = modelHelper.cleanForm(this.getEntitySchema(), language, props);

    props._key = props.id;
    props._entity_type = className;


    db.collection(cfg.entity_collection).save(props).then(
        //Success
        function(result) {
            deferred.resolve({id : props.id});
        },
        //Failure
        function(err) {
            deferred.reject({
                id : err.num,
                code: err.code,
                message: err.message
            });
        }
    );

    return deferred.promise;
}

function update(language, id, data) {

    var deferred = q.defer();
    var entityName = this.getEntityName();
    var eCol = cfg.entity_collection;

    delete data['id'];
    data = JSON.stringify(modelHelper.cleanForm(this.getEntitySchema(), language, data, true));

    var query = `UPDATE '${id}' WITH ${data} IN ${eCol}`;
    modelHelper.executeQuery(query)
        .then(() => deferred.resolve())
        .fail(() => deferred.reject());

    return deferred.promise;

}

function remove(id) {

    var deferred = q.defer();

    var eCol = cfg.entity_collection;
    var rCol = cfg.relation_collection;

    var queries = [];
    queries.push(`
        LET eid = '${id}'
        FOR r IN ${rCol}
            FILTER r._from == eid || r._to == eid
            REMOVE r IN ${rCol}`
    );
    queries.push(`REMOVE '${id}' IN ${eCol}`);

    modelHelper.executeQueries(queries)
        .then(() => {deferred.resolve()})
        .fail(() => {deferred.reject()});

    return deferred.promise;

}

function getOne(language, id) {

    var deferred = q.defer();
    var eCol = cfg.entity_collection;
    var rCol = cfg.relation_collection;

    var query = `
    LET eid = '${id}'
    LET r_outgoing = (FOR r1 IN ${rCol} FILTER r1._from == CONCAT('${eCol}/', eid) RETURN r1)
    LET r_incoming = (FOR r2 IN ${rCol} FILTER r2._to   == CONCAT('${eCol}/', eid) RETURN r2)
    LET e = (FOR e in ${eCol} FILTER e._key == eid RETURN e)
    RETURN {
        'entity': e[0],
        'relationships': {
            'incoming': r_incoming,
            'outgoing': r_outgoing
        }
    }`;

    modelHelper.getOneRecord(query).then(
            record => {
            var modelHelper = alfehrest.helpers.model;
            if(record.entity){
                record.entity = modelHelper.detranslateObject(record.entity, language);
                for(var idx in record.relationships) {
                    for(var i=0; i<record.relationships[idx].length; i++) {
                        record.relationships[idx][i] = modelHelper.detranslateObject(record.relationships[idx][i], language);
                        record.relationships[idx][i]['id'] = record.relationships[idx][i]['_key'];
                        delete record.relationships[idx][i]['_from'];
                        delete record.relationships[idx][i]['_to'];
                        delete record.relationships[idx][i]['_rev'];
                        delete record.relationships[idx][i]['_id'];
                    }
                }
            }
            deferred.resolve(record);
        },
        () => {

        }
    );

    return deferred.promise;
}

function getAll(language) {

    var deferred = q.defer();
    var entityName = this.getEntityName();
    var nameField = this.getNameField();
    var eCol = cfg.entity_collection;

    var query = `
        FOR e in ${eCol}
            FILTER e._entity_type == '${entityName}'
        RETURN {id: e.id, name: e.strings['${language}']['${nameField}'], entity_type: e._entity_type}
    `;

    modelHelper.getAllRecords(query)
        .then(
            records => {
            deferred.resolve(records);
        }
    );

    return deferred.promise;
}

function getEntityName() { return "Node"; }

function getNameField() { return "name"; }

function getRelationshipSchema() { return {}; }

function getEntitySchema() { return {}; }

function getPreparedRelationshipSchema(language) {

    var deferred = q.defer();
    var entitySchema = this.getEntitySchema();
    var relationshipSchema = this.getRelationshipSchema();

    getAllIds(language).then(function (data) {
        var entityCache = data;
        var list = {};

        for(var idx in relationshipSchema) {

            list[idx] = {
                "secondEntityId": {
                    label: 'الكيان المرتبط',
                    type: 'List',
                    elements: entityCache[idx] || []
                },
                "types": relationshipSchema[idx]
            };

        }

        deferred.resolve({
            "entity": entitySchema,
            "relationships": list
        });

    });

    return deferred.promise;
}



function getAllIds(language) {

    var deferred = q.defer();
    var eCol = cfg.entity_collection;
    var results = {};

    var query = `
        FOR e in ${eCol}
        RETURN {id: e.id, name: e.strings['${language}']['name'], entity_type: e._entity_type}
    `;

    modelHelper.getAllRecords(query)
        .then(
            records => {
                for(var i=0; i<records.length; i++) {
                    var record = records[i];
                    if(!results[record.entity_type]) {
                        results[record.entity_type] = {}
                    }
                    results[record.entity_type][record.id] = record.name;
                }
                deferred.resolve(results);
            }
        );

    return deferred.promise;

}

function EntityModel() {

    this.create = create;
    this.update = update;
    this.remove = remove;
    this.getOne = getOne;
    this.getAll = getAll;

    this.getEntityName = getEntityName;
    this.getRelationshipSchema = getRelationshipSchema;
    this.getEntitySchema = getEntitySchema;

    this.getPreparedRelationshipSchema = getPreparedRelationshipSchema;

}

//Static Methods
EntityModel.getAllIds = getAllIds;

module.exports = EntityModel;
