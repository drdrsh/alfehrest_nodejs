var BaseModel = require("./base/entity.js");
var instance;

function PlaceModel() {

    BaseModel.call(this);

    this.getEntityName = function(){
        return "place";
    };

    this.getRelationshipSchema = function() {
        return {};
    };

    this.getEntitySchema = function() {
        return {};
    };

}

require("util").inherits(PlaceModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new PlaceModel());
    }
};
