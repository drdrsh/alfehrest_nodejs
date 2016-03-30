'use strict';

var EntityController = require(framework.helpers.path.controllers('entity', true));

function PersonController(app, router) {
    this.getEntityName = function() {
        return "person";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(PersonController, EntityController);
module.exports = PersonController;