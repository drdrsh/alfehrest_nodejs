'use strict';

function validateDate() {
    //This is set to current field

    var value = this.value;
    if(!'first_date' in value || !'mode' in value) {
        throw framework.error(1, 400, 'Invalid date value for ' + idx);
    }

    if(isNaN(value['first_date'])) {
        throw framework.error(1, 400, 'Invalid date value for ' + idx);
    }

    var mode = value['mode'];
    var validModes = ['before', 'after', 'between', 'approx', 'exact'];
    if(validModes.indexOf(mode) == -1) {
        throw framework.error(1, 400, 'Invalid mode value for ' + idx);
    }

    if(mode == 'between') {
        if(!'second_date' in value || isNaN(value['second_date'])) {
            throw framework.error(1, 400, 'Invalid second date value for ' + idx);
        }
    }

}

function validateDatePair() {

    for(var i=0; i<2; i++) {
        var value = this.value[i];
        var label = this.label[i];
        if(!'first_date' in value || !'mode' in value) {
            throw framework.error(1, 400, 'Invalid date value for ' + label);
        }

        if(isNaN(value['first_date'])) {
            throw framework.error(1, 400, 'Invalid date value for ' + label);
        }

        var mode = value['mode'];
        var validModes = ['before', 'after', 'between', 'approx', 'exact'];
        if(validModes.indexOf(mode) == -1) {
            throw framework.error(1, 400, 'Invalid mode value for ' + label);
        }

        if(mode == 'between') {
            if(!'second_date' in value || isNaN(value['second_date'])) {
                throw framework.error(1, 400, 'Invalid second date value for ' + label);
            }
        }
    }
}

function addDate(id, label, required) {

    this._formTable[id] = {
        type: "Date",
        translatable: false,
        label: label,
        required: required,
        validation: (idx, value, form) => {
            var obj = {
                'id'      : idx,
                'value'   : value,
                'form'    : form,
                'label'   : label,
                'required': required
            };
            validateDate.apply(obj);
        }
    };
}

function addField(id, value) {
    this._formTable[id] = value;
}

function addDatePair(ids, labels, requireds) {

    var firstId = ids[0];
    var secondId = ids[1];

    var firstLabel = labels[0];
    var secondLabel = labels[1];

    var firstRequired = requireds[0];
    var secondRequired = requireds[1];

    this._formTable[firstId] = {
        type: "Date",
        translatable: false,
        label: firstLabel,
        required: firstRequired,
        validation: (idx, value, form) => {
            var obj = {
                'form': form,
                'id'      : [firstId, secondId],
                'label'   : [firstLabel, secondLabel],
                'value'   : [form[firstId], form[secondId]],
                'required': [firstRequired, secondRequired]
            };
            validateDatePair.apply(obj);
        }
    };

    this._formTable[secondId] = {
        type: "Date",
        translatable: false,
        label: secondLabel,
        required: secondRequired,
        validation: null
    };
}

function addML(id, label, translatable, required) {
    this._formTable[id] = {
        type: "MultiL",
        translatable: true,
        label: label,
        required: required,
        validation: function(idx, value, form) {
           if(!Array.isArray(value)) {
                throw framework.error(1, 400, `Invalid value for for ${label}`);
            }
        }
    };
}

function addComment() {
    this._formTable['comments'] = {
        type: "TextArea",
        translatable: true,
        label: "تعليق"
    };
}

function addRef() {
    this._formTable['references'] = {
        type: "MultiL",
        translatable: true,
        label: "مراجع"
    };
}

function addId() {
    this._formTable["id"] = {
        "type": "HiddenField",
            translatable: false,
            "validation": null
    };
}

function addVersion() {

    var label =  "حالة الملف";
    this._formTable['revisionState'] = {
        "type": "List",
        translatable: true,
        "label": label,
        "elements": {
            "DRAFT": "Draft",
            "FIRST": "First Revision",
            "SECOND": "Second Revision",
            "FINAL": "Final"
        },
        "validation" : function(idx, value, form) {
            if(["DRAFT", "FIRST", "SECOND", "FINAL"].indexOf(value) === -1) {
                throw framework.error(1, 400, `Invalid value for for ${label}`);
            }
        }
    };

}

function getSchema(){
    return this._formTable;
}

function FormDefinition(src) {
    this._formTable  = {};
    this.add         = addField;
    this.addId       = addId;
    this.addML       = addML;
    this.addDate     = addDate;
    this.addDatePair = addDatePair;
    this.addComment  = addComment;
    this.addRef      = addRef;
    this.addVersion  = addVersion;
    this.getSchema   = getSchema;
}


module.exports = FormDefinition;
