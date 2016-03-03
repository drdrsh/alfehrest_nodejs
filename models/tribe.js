var BaseModel = require("./base/entity.js");
var instance;

function TribeModel() {

    BaseModel.call(this);

    this.getEntityName = function(){
        return "tribe";
    };

    this.getRelationshipSchema = function() {
        return {};
    };

    this.getEntitySchema = function() {
        return {};
    };

}

require("util").inherits(TribeModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new TribeModel());
    }
};
