'use strict';

var rand   = require('shortid');
var assert = require('assert');
var http   = require('http');
var request= require('superagent');
var expect = require('expect.js');
var fs     = require('fs');

var server = null;
process.env.port = "2000";
process.env.NODE_ENV = "test";
process.env.silent = false;

var rootURL = 'localhost:' + process.env.port + '/api/';

describe('AlFehrestGraphServerTests', function () {

    var testFiles = fs.readdirSync(__dirname + '/files/');

    before(function () {
        server = require('../app.js').server;
    });

    after(function () {
        server.close();
    });

    for(let i=0; i<testFiles.length; i++) {

        if(!new RegExp(".js$").test(testFiles[i])) {
            continue;
        }

        let testFN = __dirname + '/files/' + testFiles[i];

        require(testFN)(rootURL);
    }

});