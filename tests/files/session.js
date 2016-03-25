'use strict';

var rand   = require('shortid');
var assert = require('assert');
var http   = require('http');
var request= require('superagent');
var expect = require('expect.js');
var fs     = require('fs');

module.exports = function(rootURL) {

    var sessionId = null;
    describe('session', function () {

        it('Probe session state w/o authorization: Should fail', function (done) {
            request
                .get(rootURL + 'session/')
                .set('Content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 401);
                    done();
                });
        });

        it('Access open endpoint w/o authorization: Should succeed', function (done) {
            request
                .get(rootURL + 'person/')
                .set('content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 200);
                    done();
                });
        });

        it('Access secure endpoint w/o authorization: Should fail', function (done) {
            request
                .post(rootURL + 'person/')
                .set('content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 401);
                    done();
                });
        });

        it('Login with invalid Credential: Should fail', function (done) {
            request
                .post(rootURL + 'session/')
                .send({'username': 'asd', 'password': 'asd'})
                .set('Content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 401);
                    done();
                });
        });

        it('Login with correct credential: Should succeed', function (done) {
            request
                .post(rootURL + 'session/')
                .send({'username': 'test', 'password': 'test'})
                .set('Content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 200);
                    assert.ok(r.body.sessionId);
                    sessionId = r.body.sessionId;
                    done();
                });
        });

        it('Duplicate login with correct credential: Should fail', function (done) {
            request
                .post(rootURL + 'session/')
                .send({'username': 'test', 'password': 'test'})
                .set('Authorization', sessionId)
                .set('Content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 403);
                    done();
                });
        });

        it('Probe session state: Should succeed', function (done) {
            request
                .get(rootURL + 'session/')
                .set('Authorization', sessionId)
                .set('Content-language', 'ar')
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 204);
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

        it('Probe session state: Should fail', function (done) {
            request
                .get(rootURL + 'session/')
                .set('Content-language', 'ar')
                .set('Authorization', sessionId)
                .end(function (err, r) {
                    assert.equal(r.res.statusCode, 401);
                    done();
                });
        });


    });
};