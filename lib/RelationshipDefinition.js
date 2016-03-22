'use strict';

var mSrc = null;
var mRelationshipTable = {};

function addRelationship(dest, id, label, props) {

    dest = dest.toLowerCase();
    if(! (dest in mRelationshipTable) ){
        mRelationshipTable[dest] = {};
    }

    props.id = {type: 'HiddenField'};
    props.type = {type: 'ReadOnly'};
    mRelationshipTable[dest][id] = {
        label: id,
        fields: props
    };

}

function getSchema(){
    return mRelationshipTable;
}

function RelationshipDefinition(src) {
    mSrc = src.toLowerCase();
    this.addRelationship = addRelationship;
    this.getSchema = getSchema;
}


module.exports = RelationshipDefinition;
