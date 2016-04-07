'use strict';

var BaseModel = require(framework.helpers.path.models('entity', true));

var instance;

function Person2Model() {

    BaseModel.call(this);

    this.getEntityName = function () {
        return "person2"
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

        var relationships = ["related_a", "related_b"];
        for (let i = 0; i < relationships.length; i++) {
            relDef.addRelationship("person1", relationships[i], relationships[i], formDef.getSchema());
            relDef.addRelationship("person2", relationships[i], relationships[i], formDef.getSchema());
            relDef.addRelationship("person3", relationships[i], relationships[i], formDef.getSchema());
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

require("util").inherits(Person2Model, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new Person2Model());
    }
};
