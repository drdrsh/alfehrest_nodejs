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
        const ENTITY_MAX = 3;
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
            it(`Create valid object ${i}: Should succeed`, function (done) {
                request
                    .post(rootURL + 'person/')
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
                    let rels =
                        JSON.parse(fs.readFileSync('tests/data/person/valid_person_person_rel.json'));
                    let rel = rels[Math.floor(Math.random()*rels.length)];
                    rel.firstEntityId = entityIds[i];
                    rel.secondEntityId= entityIds[j];
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
                        .put(rootURL + 'person/' + entityIds[i] + '/')
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

        for(let i=0; i<ENTITY_MAX; i++) {
            it(`Read relationships for ${i}: Should Succeed`, function (done) {
                request
                    .get(rootURL + 'person/' + entityIds[i] + '/')
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
            request
                .delete(rootURL + 'person/')
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
                request
                    .get(rootURL + 'person/' + entityIds[i] + '/')
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
                request
                    .delete(rootURL + 'person/')
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
