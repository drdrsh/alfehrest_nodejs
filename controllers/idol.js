var EntityController = require("./base/entity.js");

function IdolController(app, router) {
    this.getEntityName = function() {
        return "idol";
    };
    EntityController.call(this, app, router);
}

require("util").inherits(IdolController, EntityController);
module.exports = IdolController;