'use strict';

var EntityController = require(framework.helpers.path.controllers('entity', true));

function Person3Controller(app, router) {
    this.getEntityName = function() {
        return "person3";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(Person3Controller, EntityController);
module.exports = Person3Controller;