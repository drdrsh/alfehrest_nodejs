'use strict';

var rand   = require('shortid');
var assert = require('assert');
var http   = require('http');
var request= require('superagent');
var expect = require('expect.js');
var fs     = require('fs');

module.exports = function(rootURL) {

    var sessionId = null;
    describe('relationships', function () {
        const ENTITY_COUNT = 1;
        const ENTITY_TYPES = ['person1', 'person2', 'person3'];
        const ENTITY_MAX   = ENTITY_TYPES.length * ENTITY_COUNT;
        let entityIds = [];
        let relIds = [];
        for(let i=0; i<ENTITY_MAX; i++) {
            entityIds.push(null);
            relIds.push([]);
            for(let j=0; j<ENTITY_MAX; j++) {
                relIds[i].push(null);
            }
        }

        it('Login with correct credentials: Should succeed', function (done) {
            request
                .post(rootURL + 'session/')
                .set('content-language', 'ar')
                .send({"username": "test", "password": "test"})
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 200);
                    sessionId = r.body.sessionId;
                    done();
                });
        });

        for(let i=0; i<ENTITY_MAX; i++) {
            let etype = ENTITY_TYPES[i%ENTITY_TYPES.length];
            it(`Create valid object ${i}: Should succeed`, function (done) {
                request
                    .post(rootURL + etype + '/')
                    .send(JSON.parse(fs.readFileSync('tests/data/person/create_valid_person.json')))
                    .set('content-language', 'ar')
                    .set('Authorization', sessionId)
                    .end(function (err, r) {
                        assert.ok(r.res.body.id);
                        assert.equal(r.res.statusCode, 200);
                        //Thanks ES5 for the let keyword, if this loop counter was var I would be screwed
                        entityIds[i] = r.res.body.id;
                        done();
                    });
            });
        }

        let cummRel = {};
        for(let i=0; i<ENTITY_MAX; i++) {
            for(let j=0; j<ENTITY_MAX; j++) {
                let requestCounter = 0;
                let strRes = (i===j)?'fail':'succeed';
                it(`Create relationship from ${i} to ${j}: Should ${strRes}`, function (done) {

                    let controller_i = entityIds[i].split('_')[0];
                    let controller_j = entityIds[j].split('_')[0];

                    let rels =
                        JSON.parse(fs.readFileSync('tests/data/person/valid_person_person_rel.json'));
                    let rel = rels[Math.floor(Math.random()*rels.length)];
                    rel.firstEntityId   = entityIds[i];
                    rel.secondEntityId  = entityIds[j];
                    rel.firstEntityType = controller_i;
                    rel.secondEntityType= controller_j;
                    rel.type            = controller_j + '.' + rel.relationship;
                    rel.comments = `${rel.firstEntityId}_${rel.secondEntityId}`;

                    var relToSave = [];
                    if(!(entityIds[i] in cummRel)) {
                        cummRel[entityIds[i]] = [];
                    }
                    if(i != j) {
                        cummRel[entityIds[i]].push(rel);
                        relToSave = cummRel[entityIds[i]];
                    } else {
                        relToSave.push(rel);
                    }

                    let partialEntity = {
                        'id': entityIds[i],
                        'relationships': relToSave
                    };

                    request
                        .put(rootURL +  controller_i + '/' + entityIds[i] + '/')
                        .set('content-language', 'ar')
                        .set('Authorization', sessionId)
                        .send(partialEntity)
                        .end(function(err, r) {
                            if (i === j) {
                                assert.equal(r.status, 400);
                            } else {
                                assert.equal(r.status, 204);
                            }
                            done();
                        });
                });
            }
        }

        it(`Create invalid relationship from 0 to 1: Should fail`, function (done) {
            let i = 0;
            let j = 1;
            let controller_i = entityIds[i].split('_')[0];
            let controller_j = entityIds[j].split('_')[0];

            let rels =
                JSON.parse(fs.readFileSync('tests/data/person/invalid_person_person_rel.json'));
            let rel = rels[Math.floor(Math.random()*rels.length)];
            rel.firstEntityId   = entityIds[i];
            rel.secondEntityId  = entityIds[j];
            rel.firstEntityType = controller_i;
            rel.secondEntityType= controller_j;
            rel.type            = controller_j + '.' + rel.relationship;
            rel.comments = `${rel.firstEntityId}_${rel.secondEntityId}`;

            let partialEntity = {
                'id': entityIds[i],
                'relationships': [rel]
            };

            request
                .put(rootURL +  controller_i + '/' + entityIds[i] + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(partialEntity)
                .end(function(err, r) {
                    assert.equal(r.status, 400);
                    done();
                });
        });

        let selectedItem = 1;
        it(`Read entity ${selectedItem}'s with related entities: Should Succeed`, function (done) {
            let controller = entityIds[selectedItem].split('_')[0];
            request
                .get(rootURL + controller + '/' + entityIds[selectedItem] + '/related/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function(err, r) {
                    assert.equal(r.status, 200);
                    let rels = r.body.relationships;
                    assert.equal(rels.outgoing.length, ENTITY_MAX-1);
                    assert.equal(rels.incoming.length, ENTITY_MAX-1);
                    for(let x=0;x<ENTITY_MAX-1;x++) {
                        let rel1 = rels.outgoing[x];
                        let rel2 = rels.incoming[x];
                        assert.equal(rel1.firstEntityId,  entityIds[selectedItem]);
                        assert.equal(rel2.secondEntityId, entityIds[selectedItem]);
                        assert.equal(rel1.entity.id, rel1.secondEntityId);
                        assert.equal(rel2.entity.id, rel2.firstEntityId);
                        assert.equal(rel1.comments, `${entityIds[selectedItem]}_${rel1.secondEntityId}`);
                        assert.equal(rel2.comments, `${rel2.firstEntityId}_${entityIds[selectedItem]}`);
                    }
                    done();
                });
        });

        it(`Read a filtered ${selectedItem}'s related entities : Should Succeed`, function (done) {
            let controller = entityIds[selectedItem].split('_')[0];
            let allowedTypes = [];
            for(let i=0; i<ENTITY_TYPES.length-1; i++) {
                if(ENTITY_TYPES[i] == controller) {
                    continue;
                }
                allowedTypes.push(ENTITY_TYPES[i]);
            }

            request
                .get(rootURL + controller + '/' + entityIds[selectedItem] + '/related/?types=' + allowedTypes.join(','))
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function(err, r) {
                    assert.equal(r.status, 200);
                    let rels = r.body.relationships;
                    const EXPECTED_COUNT = allowedTypes.length * ENTITY_COUNT;
                    assert.equal(rels.outgoing.length, EXPECTED_COUNT);
                    assert.equal(rels.incoming.length, EXPECTED_COUNT);
                    for(let x=0;x<EXPECTED_COUNT-1;x++) {
                        let rel1 = rels.outgoing[x];
                        let rel2 = rels.incoming[x];
                        assert.notEqual(allowedTypes.indexOf(rel1.entity._entity_type), -1);
                        assert.notEqual(allowedTypes.indexOf(rel2.entity._entity_type), -1);
                    }
                    done();
                });
        });

        for(let i=0; i<ENTITY_MAX; i++) {
            it(`Read relationships for ${i}: Should Succeed`, function (done) {
                let controller = entityIds[i].split('_')[0];
                request
                    .get(rootURL + controller + '/' + entityIds[i] + '/')
                    .set('content-language', 'ar')
                    .set('Authorization', sessionId)
                    .end(function(err, r) {
                        assert.equal(r.status, 200);
                        let rels = r.body.relationships;
                        assert.equal(rels.outgoing.length, ENTITY_MAX-1);
                        assert.equal(rels.incoming.length, ENTITY_MAX-1);
                        for(let x=0;x<ENTITY_MAX-1;x++) {
                            let rel1 = rels.outgoing[x];
                            let rel2 = rels.incoming[x];
                            assert.equal(rel1.firstEntityId,  entityIds[i]);
                            assert.equal(rel2.secondEntityId, entityIds[i]);
                            assert.equal(rel1.comments, `${entityIds[i]}_${rel1.secondEntityId}`);
                            assert.equal(rel2.comments, `${rel2.firstEntityId}_${entityIds[i]}`);
                        }
                        done();
                    });
            });
        }

        it(`Delete entity ${ENTITY_MAX-1}: Should succeed`, function (done) {
            let controller = entityIds[ENTITY_MAX-1].split('_')[0];
            request
                .delete(rootURL + controller + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send({'id': entityIds[ENTITY_MAX-1]})
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 204);
                    done();
                });
        });


        for(let i=0; i<ENTITY_MAX-1; i++) {
            it(`Read relationships for ${i}: Should Succeed`, function (done) {
                let controller = entityIds[i].split('_')[0];
                request
                    .get(rootURL + controller + '/' + entityIds[i] + '/')
                    .set('content-language', 'ar')
                    .set('Authorization', sessionId)
                    .end(function(err, r) {
                        assert.equal(r.status, 200);
                        let rels = r.body.relationships;
                        assert.equal(rels.outgoing.length, ENTITY_MAX-2);
                        assert.equal(rels.incoming.length, ENTITY_MAX-2);
                        done();
                    });
            });
        }

        for(let i=0; i<ENTITY_MAX-1; i++) {
            it(`Delete entity ${i}: Should succeed`, function (done) {
                let controller = entityIds[i].split('_')[0];
                request
                    .delete(rootURL + controller + '/')
                    .set('content-language', 'ar')
                    .set('Authorization', sessionId)
                    .send({'id': entityIds[i]})
                    .end(function (err, r) {
                        assert.equal(r.res.statusCode, 204);
                        done();
                    });
            });
        }

        it('Logout: Should succeed', function (done) {
            request
                .delete(rootURL + 'session/')
                .set('Content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 204);
                    done();
                });
        });

    });
};
