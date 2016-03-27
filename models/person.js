'use strict';

var BaseModel = require("./base/entity.js");
var instance;

function PersonModel() {

    BaseModel.call(this);

    this.getEntityName = function () {
        return "person"
    };

    this.getNameField = function () {
        return "name"
    };

    this.getRelationshipSchema = function () {

        var fields = null;
        var relDef = framework.helpers.library.create("RelationshipDefinition", this.getEntityName());
        var formDef = null;

        formDef = framework.helpers.library.create("FormDefinition");
        formDef.addComment();
        formDef.addRef();

        var relationships = ["related"];
        for (let i = 0; i < relationships.length; i++) {
            //TODO: send proper translation based on request language
            relDef.addRelationship("transcript", relationships[i], relationships[i], formDef.getSchema());
        }


        var relationships = ["interested_in", "wrote_about", "died_in", "took_part_in", "related"];
        for (let i = 0; i < relationships.length; i++) {
            //TODO: send proper translation based on request language
            relDef.addRelationship("event", relationships[i], relationships[i], formDef.getSchema());
        }

        var relationships = ["sareeh", "montaqel", "mostalhaq", "abd", "mawla"];
        for (let i = 0; i < relationships.length; i++) {
            //TODO: send proper translation based on request language
            relDef.addRelationship("tribe", relationships[i], relationships[i], formDef.getSchema());
        }

        formDef = framework.helpers.library.create("FormDefinition");
        formDef.addDatePair(['dateStarted', 'dateEnded'], ['البدء', 'النهاية'], [false, false]);
        formDef.addComment();
        formDef.addRef();

        relationships = ["zawj", "sehr", "related", "other"];
        for (let i = 0; i < relationships.length; i++) {
            relDef.addRelationship("person", relationships[i], relationships[i], formDef.getSchema());
        }

        formDef = framework.helpers.library.create("FormDefinition");
        formDef.addComment();
        formDef.addRef();

        relationships = [
            "am", "wld_akh", "khal", "wld_okht", "akh_shaqiq", "akh_ab", "akh_om", "waled", "wld",
            "waled_rada", "wld_rada", "akh_rada", "wld_am_a", "wld_khalh_k", "wld_khal_a", "wld_ama_k",
            "wld_am_k", "wld_khalh_a"
        ];
        for (let i = 0; i < relationships.length; i++) {
            relDef.addRelationship("person", relationships[i], relationships[i], formDef.getSchema());
        }

        return relDef.getSchema();
    };

    this.getEntitySchema = function () {

        var formDef = framework.helpers.library.create("FormDefinition");

        formDef.addId();
        formDef.add('name', {
            "type": "TextField",
            translatable: true,
            "label": "الاسم",
            "required": true,
            "validation": null
        });

        formDef.addML('titles', "الألقاب", true, false);
        formDef.addML('nicknames', "الكنى", true, false);

        formDef.add("bio", {
            "type": "TextArea",
            translatable: true,
            "label": "تعريف بالشخص",
            "validation": null
        });
        formDef.addVersion();
        formDef.addDatePair(['born', 'died'], ['تاريخ الميلاد', 'تاريخ الوفاة'], [false, false]);
        formDef.addRef();

        return formDef.getSchema();
    };




}

require("util").inherits(PersonModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new PersonModel());
    }
};
