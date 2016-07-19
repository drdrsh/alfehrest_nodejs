'use strict';

var mockDB  = require('./helpers/db.js');
var rand    = require('shortid');
var assert  = require('assert');
var http    = require('http');
var request = require('superagent');
var expect  = require('expect.js');
var fs      = require('fs');
var ncp     = require('ncp');
var rimraf  = require('rimraf');
var randStr = rand.generate();
var appName = `app_${randStr}`;

//Hello from 11 KM above the atlantic
var server = null;
process.env.appId    = appName;
process.env.port     = "6666";
process.env.NODE_ENV = "test";
process.env.silent   = false;

var rootPrefix = '/' + randStr;
var rootURL =  'localhost:' + process.env.port + rootPrefix + '/';

describe('AlFehrestGraphServerTests', function () {

    this.timeout(15000);

    function prepareSettings() {

        let buf = null;
        let settingsFN = `apps/${appName}/settings/general.js`;
        let databaseFN = `apps/${appName}/settings/database.js`;


        buf = fs.readFileSync(settingsFN, "utf8");
        buf = buf
            .replace('$$APP_NAME$$', appName)
            .replace('$$API_ROOT$$', rootPrefix);
        fs.writeFileSync(settingsFN, buf, 'utf-8');

        let suffix = rand.generate().replace('-', '_');
        buf = fs.readFileSync(databaseFN, "utf8");
        buf = buf
            .replace('$$DB_NAME$$', `db_${suffix}`)
            .replace('$$GRAPH_NAME$$', `graph_${suffix}`)
            .replace('$$ENTITY_CNAME$$', `ecol_${suffix}`)
            .replace('$$REL_CNAME$$', `rcol_${suffix}`);
        fs.writeFileSync(databaseFN, buf, 'utf-8');

    }

    var testFiles = fs.readdirSync(__dirname + '/files/');

    before(function (done) {
        try {
            fs.mkdirSync(`apps`);
            fs.mkdirSync(`apps/${appName}`);
        } catch(e) {;}
        ncp('./tests/data/app/', `apps/${appName}`, function (err) {

            prepareSettings();

            let dbFN = `../apps/${appName}/settings/database.js`;
            let dbSettings = require(dbFN);
            dbSettings = dbSettings[process.env.NODE_ENV];

            mockDB.build(dbSettings).then(function(){
                server = require('../app.js').server;
                server.on('listening', done);
            });

        });
    });

    after(function (done) {
        let dbFN = `../apps/${appName}/settings/database.js`;
        let dbSettings = require(dbFN);
        dbSettings = dbSettings[process.env.NODE_ENV];
        mockDB
            .destroy(dbSettings)
            .then(() => {
                rimraf.sync(`apps/${appName}`);
                server.close(done);
            }, (err) => {
            });
    });

    for(let i=0; i<testFiles.length; i++) {

        if(!new RegExp(".js$").test(testFiles[i])) {
            continue;
        }

        let testFN = __dirname + '/files/' + testFiles[i];

        require(testFN)(rootURL);
    }

});


