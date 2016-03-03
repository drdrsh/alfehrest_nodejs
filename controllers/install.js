var q = require('q');

function InstallController(app, router) {


    function installSchema(req, res) {

        var modelHelper = alfehrest.helpers.model;
        var generalConfig = alfehrest.helpers.settings.get("general");
        var databaseConfig= alfehrest.helpers.settings.get("database");

        var database = modelHelper.getDatabase();

        database.graph(databaseConfig.graph_name).drop(true)
            .then(
                () => {return database.collection(databaseConfig.entity_collection).create()},
                () => {return database.collection(databaseConfig.entity_collection).create()}
            )
            .then(
                () => {return database.graph(databaseConfig.graph_name).create()}, null
            )
            .then(
                () => {return database.graph(databaseConfig.graph_name).addEdgeDefinition({
                    to: [databaseConfig.entity_collection],
                    from: [databaseConfig.entity_collection],
                    collection: databaseConfig.relation_collection
                })}, null
            )
            .then(
                () => {res.send({})},
                () => {res.send({})}
            );

    }
    router.post('/install/', installSchema);

}

module.exports = InstallController;
