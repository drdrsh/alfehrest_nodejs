'use strict';

var BaseModel = require("./base/entity.js");
var instance;

function IdolModel() {

    BaseModel.call(this);

    this.getEntityName = function(){
        return "idol";
    };

    this.getRelationshipSchema = function() {
        return {};
    };

    this.getEntitySchema = function() {
        return {};
    };

}

require("util").inherits(IdolModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new IdolModel());
    }
};
