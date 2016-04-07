'use strict';

var EntityController = require(framework.helpers.path.controllers('entity', true));

function Person1Controller(app, router) {
    this.getEntityName = function() {
        return "person1";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(Person1Controller, EntityController);
module.exports = Person1Controller;