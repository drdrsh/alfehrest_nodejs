'use strict';

var assert = require('assert');
var http   = require('http');
var request= require('superagent');
var expect = require('expect.js');
var fs     = require('fs');

var server = null;
process.env.port = 500;
var rootURL = 'localhost:' + process.env.port + '/api/';


describe('person', function () {

    before(function () {
        server = require('../app.js').server;
    });

    after(function () {
        server.close();
    });

    describe('#create_invalid', function () {
        it('Invalid Object 1', function (done) {
            request
                .post(rootURL + 'person')
                .set('content-language', 'ar')
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_1.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });
        it('Invalid Object 2', function (done) {
            request
                .post(rootURL + 'person')
                .set('content-language', 'ar')
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_2.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });
        it('Invalid Object 3', function (done) {
            request
                .post(rootURL + 'person')
                .set('content-language', 'ar')
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_invalid_person_3.json')))
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 400);
                    done();
                });
        });
    });


    describe('#create_valid', function () {
        var newId = null;
        it('Creates valid object', function (done) {
            request
                .post(rootURL + 'person')
                .set('content-language', 'ar')
                .send(JSON.parse(fs.readFileSync('tests/data/person/create_valid_person.json')))
                .end(function (err, r) {
                    newId = r.res.body.id;
                    assert.equal(r.res.statusCode, 200);
                    done();
                });
        });

        it('Read valid entity Object', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
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
                    done();
                });
        });

        it('Delete Object', function (done) {
            request
                .delete(rootURL + 'person/')
                .set('content-language', 'ar')
                .send({'id': newId})
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 204);
                    done();
                });
        });

        it('Reads the deleted Object', function (done) {
            request
                .get(rootURL + 'person/' + newId + '/')
                .set('content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 404);
                    done();
                });
        });


    });


});