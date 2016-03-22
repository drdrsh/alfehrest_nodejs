'use strict';

var EntityController = require("./base/entity.js");

function PlaceController(app, router) {
    this.getEntityName = function() {
        return "place";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(PlaceController, EntityController);
module.exports = PlaceController;
