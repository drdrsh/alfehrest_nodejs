var q = require('q');

function EntityController(app, router) {

    var language = alfehrest.currentLanguage;

    var getEntityName = this.getEntityName || function() { return null; };

    function getDatabase() { return alfehrest.helpers.model.getDatabase(); }

    function loadEntityModel(entityName) { return alfehrest.helpers.model.get(entityName); }

    function loadModel() { return loadEntityModel(getEntityName());}

    function post(req, res) {

        var model = loadModel();

        var relationships = req.body.relationships;
        delete req.body.relationships;

        var newEntityId = null;
        model
            .create(language, req.body)
            .then(function (data) {

                newEntityId = data.id;

                if(!relationships){
                    res.send({id: newEntityId});
                    return;
                }

                for (var i=0; i<relationships.length; i++) {
                    relationships[i].first_entity_id = newEntityId;
                }

                var model = loadEntityModel('relationship');
                model
                    .create(language, newEntityId, relationships, false)
                    .then(function(data) {
                        res.send({id: newEntityId});
                    })
                    .fail(function(err){
                        res.status(err.code).send(err.message);
                    });
            })
            .fail(function(err){
                res.status(err.code).send(err.message);
            });
    }

    function getAll(req, res) {

        var model = loadModel();

        model.getAll(language).then(function(data){
            res.send(data);
        }).fail(function(error){
            res.send(error);
        });

    }

    function getOne(req, res) {

        var id = req.params.id;
        var entityType = getEntityName();
        if(!id.startsWith(entityType)){
            res.status(404).send("Not Found");
            return;
        }

        var model = loadModel();

        model.getOne(language, id).then(function(data){
            res.send(data);
        }).fail(function(err){
            res.status(err.code).send(err.message);
        });

    }

    function update(req, res){

        var id = req.body.id;
        var entityType = getEntityName();
        if(!id.startsWith(entityType)){
            res.status(404).send("Not Found");
            return;
        }

        var entityModel = loadModel();
        var relationshipModel = loadEntityModel('relationship');

        var incomingRelationships = req.body.relationships;
        delete req.body.relationships;

        q.all([
            entityModel.update(language, id, req.body),
            relationshipModel.update(language, id, incomingRelationships)
        ])
        .then((results) => {
            res.status(204).send();
        })
        .fail(function(err){
            res.status(err.code).send(err.message);
        });

    }

    function remove(req, res){

        var id = req.body.id;
        var entityType = getEntityName();
        if(!id.startsWith(entityType)){
            res.status(404).send("Not Found");
            return;
        }

        var model = loadModel();


        model.remove(id).then(function(data){
            res.status(204).send();
        }).fail(function(err){
            res.status(err.code).send(err.message);
        })

    }

    function getSchema(req, res) {

        var entityType = getEntityName();
        var db = getDatabase();

        loadModel().getPreparedRelationshipSchema(language)
            .then(function(data){
                res.send(data);
            });

    }

    router.get('/' + getEntityName() + '/schema/', getSchema);
    router.get('/' + getEntityName() + '/:id/', getOne);
    router.get('/' + getEntityName() + '/', getAll);
    router.post('/' + getEntityName() + '/', post);
    router.delete('/' + getEntityName() + '/', remove);
    router.put('/' + getEntityName() + '/:id/', update);

}

module.exports = EntityController;