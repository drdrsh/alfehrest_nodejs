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
        var relDef = framework.helpers.library.getInstance("RelationshipDefinition", this.getEntityName());
        var formDef = null;

        formDef = framework.helpers.library.getInstance("FormDefinition");
        formDef.addComment();
        formDef.addRef();

        var relationships = ["interested_in", "wrote_about", "died_in", "took_part_in"];
        for (var i = 0; i < relationships.length; i++) {
            //TODO: send proper translation based on request language
            relDef.addRelationship("event", relationships[i], relationships[i], formDef.getSchema());
        }

        formDef = framework.helpers.library.getInstance("FormDefinition");
        formDef.addDatePair(['dateStarted', 'dateEnded'], ['البدء', 'النهاية'], [false, false]);
        formDef.addComment();
        formDef.addRef();

        relationships = ["in_law", "marriage", "khal", "am",]
        for (var i = 0; i < relationships.length; i++) {
            relDef.addRelationship("person", relationships[i], relationships[i], formDef.getSchema());
        }

        return relDef.getSchema();

        /*
         'صهر',
         'زوج',
         'عم',
         'ولد أخ',
         'خال',
         'ولد أخت',
         'أخ شقيق',
         'أخ لأب',
         'أخ لأم',
         'والد',
         'ولد',
         'والد بالرضاعة',
         'ولد بالرضاعة',
         'أخ بالرضاعة',
         'ولد عم (ع)',
         'ولد خالة (خ)',
         'ولد خال (ع)',
         'ولد عمة (خ)',
         'ولد عم (خ)',
         'ولد خاله (ع)',
         'أخرى'
         */
    };

    this.getEntitySchema = function () {

        var formDef = framework.helpers.library.getInstance("FormDefinition");

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
