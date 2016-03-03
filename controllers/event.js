var EntityController = require("./base/entity.js");

function EventController(app, router) {
    this.getEntityName = function() {
        return "event";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(EventController, EntityController);
module.exports = EventController;
