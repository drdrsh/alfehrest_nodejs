var BaseModel = require("./base/entity.js");
var instance;

function PersonModel() {

    BaseModel.call(this);

    this.getEntityName = function(){ return "person" };

    this.getNameField = function(){ return "name" };


    this.getRelationshipSchema = function() {

        var relDef = framework.helpers.library.getInstance("RelationshipDefinition", this.getEntityName());

        var genericFields = {
            comments: {
                type: "TextArea",
                translatable: true,
                label: "تعليق"
            },
            references: {
                type: "MultiL",
                translatable: true,
                label: "مراجع"
            }
        };

        var relationships = ["interested_in", "wrote_about", "died_in", "took_part_in"];
        for(var i=0;i<relationships.length;i++) {
            //TODO: send proper translation based on request language
            relDef.addRelationship("event", relationships[i], relationships[i], genericFields);
        }

        genericFields = {
            dateStarted: {
                type: "Date",
                translatable: false,
                label: "تاريخ بدء العلاقة"
            },
            dateEnded: {
                type: "Date",
                translatable: false,
                label: "تاريخ نهاية العلاقة"
            },
            comments: {
                type: "TextArea",
                translatable: true,
                label: "تعليق"
            },
            references: {
                type: "MultiL",
                translatable: true,
                label: "مراجع"
            }
        };

        relationships = ["in_law", "marriage", "khal", "am",]
        for(var i=0;i<relationships.length;i++) {
            relDef.addRelationship("person", relationships[i], relationships[i], genericFields);
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

    this.getEntitySchema = function() {
        return  {
            "id": {
                "type": "HiddenField",
                translatable: false,
                "validation": null
            },
            "name": {
                "type": "TextField",
                translatable: true,
                "label": "الاسم",
                "validation": null
            },
            "titles": {
                "type": "MultiL",
                translatable: true,
                "label": "الألقاب",
                "validation": null
            },
            "nicknames": {
                "type": "MultiL",
                translatable: true,
                "label": "الكنى",
                "validation": null
            },
            "bio": {
                "type": "TextArea",
                translatable: true,
                "label": "تعريف بالشخص",
                "validation": null
            },
            "revisionState": {
                "type": "List",
                translatable: true,
                "label": "حالة الملف",
                "elements": {
                    "DRAFT": "Draft",
                    "FIRST": "First Revision",
                    "SECOND": "Second Revision",
                    "FINAL": "Final"
                }
            },
            "born": {
                "type": "Date",
                translatable: false,
                "label": "تاريخ الميلاد",
                "validation": null
            },
            "died": {
                "type": "Date",
                translatable: false,
                "label": "تاريخ الوفاة",
                "validation": null
            },
            references: {
                type: "MultiL",
                translatable: true,
                label: "مراجع"
            }
        };
    };
}

require("util").inherits(PersonModel, BaseModel);

module.exports = {
    getInstance: function() {
        return instance || (instance = new PersonModel());
    }
};
