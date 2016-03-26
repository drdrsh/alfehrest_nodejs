'use strict';

var rand   = require('shortid');
var assert = require('assert');
var http   = require('http');
var request= require('superagent');
var expect = require('expect.js');
var fs     = require('fs');

module.exports = function(rootURL) {

    var sessionId = null;
    describe('person', function () {

        var newId = null;
        var newObject = null;

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

        it('Create invalid object 1: Should fail', function (done) {
            request
                .post(rootURL + 'person/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_1.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });

        it('Create invalid object 2: Should fail', function (done) {
            request
                .post(rootURL + 'person/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_2.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });

        it('Create invalid object 3: Should fail', function (done) {
            request
                .post(rootURL + 'person/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_3.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });

        it('Create valid object: Should succeed', function (done) {
            request
                .post(rootURL + 'person/')
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_valid_person.json')))
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    newId = r.res.body.id;
                    assert.equal(r.res.statusCode, 200);
                    done();
                });
        });

        it('Get all entities list', function (done) {
            request
                .get(rootURL + 'person/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 200);
                    var response = r.body;
                    assert(Array.isArray(response));
                    if(response.length) {
                        assert.ok(response[0].entity_type);
                        assert.ok(response[0].id);
                        assert.ok(response[0].name);
                    }
                    done();
                });
        });

        it('Read valid entity: Should succeed', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    var act = r.res.body.entity;
                    var org = JSON.parse(fs.readFileSync('tests/data/person/create_valid_person.json'));
                    //Simple one level check for eqaulity
                    for(var idx1 in org) {
                        if(idx1 == 'id') {
                            continue;
                        }
                        var orgValue = org[idx1];
                        if(Array.isArray(orgValue) || typeof orgValue == 'object') {
                            for(var idx2 in orgValue) {
                                assert.equal(org[idx1][idx2], act[idx1][idx2]);
                            }
                        } else {
                            assert.equal(orgValue, act[idx1]);
                        }
                    }
                    newObject = act;
                    done();
                });
        });

        it('Update entity with ID discrepancy: Should fail', function (done) {
            newObject.bio = rand.generate();
            newObject.id = 'person_XXXXXXX';
            request
                .put(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(newObject)
                .end(function (err, r) {
                    assert.equal(r.status, 400);
                    done();
                });
        });

        it('Update entity in full: Should succeed', function(done) {
            newObject.id = newId;
            newObject.bio = rand.generate();
            request
                .put(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(newObject)
                .end(function (err, r) {
                    assert.equal(r.status, 204);
                    done();
                });
        });

        it('Read updated entity: Should succeed', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    var act = r.res.body.entity;
                    assert.equal(r.res.statusCode, 200);
                    assert.equal(newObject.bio, act.bio);
                    done();
                });
        });

        var partialEntity = null;
        it('Update entity partial: Should succeed', function (done) {
            partialEntity = {'id': newId, 'bio': rand.generate()};
            request
                .put(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send(partialEntity)
                .end(function (err, r) {
                    assert.equal(r.status, 204);
                    done();
                });
        });

        it('Read updated entity: Should succeed', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    var act = r.res.body.entity;
                    assert.equal(r.res.statusCode, 200);
                    assert.equal(partialEntity.bio, act.bio);
                    assert.equal(newObject.revisionState, act.revisionState);
                    assert.deepEqual(newObject.born, act.born);
                    done();
                });
        });

        it('Delete entity: Should succeed', function (done) {
            request
                .delete(rootURL + 'person/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .send({'id': newId})
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 204);
                    done();
                });
        });

        it('Reads deleted entity: Should fail', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 404);
                    done();
                });
        });

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
