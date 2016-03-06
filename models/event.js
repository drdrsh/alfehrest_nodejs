var BaseModel = require("./base/entity.js");
var instance;

function EventModel() {

    BaseModel.call(this);

    this.getEntityName = function(){ return "event" };

    this.getNameField = function(){ return "title" };

    this.getRelationshipSchema = function() {
        return {};
    };

    this.getEntitySchema = function() {
        return {
            "id": {
                "type": "HiddenField",
                "translatable": false,
                "validation": null
            },
            "name": {
                "type": "TextField",
                "translatable": true,
                "label": "?????",
                "validation": null
            },
            "bio": {
                "type": "TextArea",
                "label": "????? ??????",
                "validation": null
            },
            "revision_state": {
                "label": "???? ?????",
                "type": "List",
                "elements": {
                    "DRAFT": "Draft",
                    "FIRST": "First Revision",
                    "SECOND": "Second Revision",
                    "FINAL": "Final"
                }
            },
            "born": {
                "type": "Date",
                "label": "????? ?????",
                "validation": null
            },
            references: {
                type: "MultiL",
                label: "?????"
            }
        }
    };
}

require("util").inherits(EventModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new EventModel());
    }
};
