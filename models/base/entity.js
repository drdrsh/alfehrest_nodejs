var uniqueIdGenerator = require('shortid');

var cfg = framework.helpers.settings.get("database");
var modelHelper = framework.helpers.model;
var db = modelHelper.getDatabase();

function create(language, props) {

    var className = this.getEntityName().toLowerCase();

    //TODO : should double check if random id already exists
    props.id   = this.getEntityName() + "_" + uniqueIdGenerator.generate();
    try {
        props = modelHelper.cleanForm(this.getEntitySchema(), language, props);
    } catch(e) {
        return Promise.reject(e);
    }

    props._key = props.id;
    props._entity_type = className;

    return new Promise(function(resolve, reject){
        db.collection(cfg.entity_collection).save(props).then(
            result => { resolve({id : props.id}); },
            err => { reject(err); }
        );
    });
}

function update(language, id, data) {

    delete data['id'];

    var entityName = this.getEntityName();
    var eCol = cfg.entity_collection;

    try {
        data = JSON.stringify(modelHelper.cleanForm(this.getEntitySchema(), language, data, true));
    } catch(e) {
        return Promise.reject(e);
    }

    var query = `UPDATE '${id}' WITH ${data} IN ${eCol}`;

    return modelHelper.executeQuery(query);
}

function remove(id) {

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

    return modelHelper.executeQueries(queries);
}

function getOne(language, id) {

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

    return new Promise(function(resolve, reject){
        modelHelper.getOneRecord(query).then(
            record => {
                var modelHelper = framework.helpers.model;
                if(record.entity) {
                    try {
                        record.entity = modelHelper.detranslateObject(record.entity, language);
                        for (var idx in record.relationships) {
                            for (var i = 0; i < record.relationships[idx].length; i++) {
                                record.relationships[idx][i] = modelHelper.detranslateObject(record.relationships[idx][i], language);
                                record.relationships[idx][i]['id'] = record.relationships[idx][i]['_key'];
                                delete record.relationships[idx][i]['_from'];
                                delete record.relationships[idx][i]['_to'];
                                delete record.relationships[idx][i]['_rev'];
                                delete record.relationships[idx][i]['_id'];
                            }
                        }
                    } catch (e) {
                        return reject(e);
                    }
                } else {
                    return reject(framework.error(1, 404, 'Not Found'));
                }
                resolve(record);
            },
            err => {reject(err)}
        );
    });

}

function getAll(language) {

    var entityName = this.getEntityName();
    var nameField = this.getNameField();
    var eCol = cfg.entity_collection;

    var query = `
        FOR e in ${eCol}
            FILTER e._entity_type == '${entityName}'
        RETURN {id: e.id, name: e.strings['${language}']['${nameField}'], entity_type: e._entity_type}
    `;

    return modelHelper.getAllRecords(query);
}

function getEntityName() { return "Node"; }

function getNameField() { return "name"; }

function getRelationshipSchema() { return {}; }

function getEntitySchema() { return {}; }

function getPreparedRelationshipSchema(language) {

    var entitySchema = this.getEntitySchema();
    var relationshipSchema = this.getRelationshipSchema();

    return new Promise(function(resolve, reject){
        getAllIds(language).then(
            data => {
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

                resolve({
                    "entity": entitySchema,
                    "relationships": list
                });

            },
            err => {reject(err)}
        );
    });
}



function getAllIds(language) {

    var generalSettings = framework.helpers.settings.get("general");
    var nameFields = {};
    for(var i=0; i<generalSettings.entities.length; i++) {
        var model = framework.helpers.model.get(generalSettings.entities[i]);
        nameFields[generalSettings.entities[i]] = model.getNameField();
    }

    var nameFieldObj = JSON.stringify(nameFields);
    var eCol = cfg.entity_collection;

    var results = {};
    var query = `
        LET nameFields = ${nameFieldObj}
        FOR e in ${eCol}
        RETURN {id: e.id, name: e.strings['${language}'][nameFields[e._entity_type]], entity_type: e._entity_type}
    `;

    return new Promise(function(resolve, reject){
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
                    resolve(results);
                },
                err => {reject(err)}
            );
    });
}

function EntityModel() {

    this.create = create;
    this.update = update;
    this.remove = remove;
    this.getOne = getOne;
    this.getAll = getAll;

    this.getEntityName = getEntityName;
    this.getNameField  = getNameField;
    this.getRelationshipSchema = getRelationshipSchema;
    this.getEntitySchema = getEntitySchema;

    this.getPreparedRelationshipSchema = getPreparedRelationshipSchema;

}

//Static Methods
EntityModel.getAllIds = getAllIds;

module.exports = EntityModel;
