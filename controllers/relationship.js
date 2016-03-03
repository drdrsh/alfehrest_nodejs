function RelationshipController(app, router) {

    /*

    function post(req, res) {
        var model = require(__base + 'models/relationship');
        model.create(req.body).then(function (data) {
            res.send(data);
        });
    }

    function update(req, res) {
        var model = require(__base + 'models/relationship');

        var id = req.params.id;
        if (!id.startsWith('Rel_')) {
            id = 'Rel_' + id;
        }

        model.update(id, req.body).then(function (data) {
            res.status(204).send();
        }).fail(function () {
            res.send(error);
        });


    }

    function deleteOne(req, res) {
        var model = require(__base + 'models/relationship');
        var id = req.body.id;

        if (!id.startsWith('Rel_')) {
            id = 'Rel_' + id;
        }

        model.delete(id).then(function (data) {
            res.status(204).send();
        }).fail(function (error) {
            res.send(error);
        });

    }

    function getIds(req, res) {
        var model = require(__base + 'models/person').getInstance();
        model.getAllIds().then(function (data) {
            res.send(data);
        });
    }

    function getTypes(req, res) {
        var relationship_matrix = require(__base + 'models/relationship_matrix.js');
        res.send(relationship_matrix.getAllRelationTypes());
    }

    function getEntites(req, res) {
        var relationship_matrix = require(__base + 'models/relationship_matrix.js');
        res.send(relationship_matrix.getAllEntityTypes());
    }

    function getLookup(req, res) {
        var entityType = req.params.entityType;
        entityType = entityType.charAt(0).toUpperCase() + entityType.substr(1);

        var relationship_matrix = require(__base + 'models/relationship_matrix.js');
        relationship_matrix.getLookup(entityType).then(function(data){
            res.send(data);
        });
    }

    /*
    router.post('/relationship/', post);
    router.get('/relationship/relationships/', getTypes);
    router.get('/relationship/entities/', getEntites);
    router.get('/relationship/ids/', getIds);
    router.get('/relationship/lookup/:entityType', getLookup);
    router.put('/relationship/:id', update);
    router.delete('/relationship/', deleteOne);
    */

};

module.exports = RelationshipController;
