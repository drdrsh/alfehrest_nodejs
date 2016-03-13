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

    describe('#create', function(){
        it('should return 200', function (done) {
            request
                .post(rootURL + 'person')
                .set('content-language', 'ar')
                .send(JSON.parse(fs.readFileSync('tests/data/create_person_1.json')))
                .end(function(err, r){
                    var res = r.res;
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });
    });
});


