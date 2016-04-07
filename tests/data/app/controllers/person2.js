'use strict';

var EntityController = require(framework.helpers.path.controllers('entity', true));

function Person2Controller(app, router) {
    this.getEntityName = function() {
        return "person2";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(Person2Controller, EntityController);
module.exports = Person2Controller;