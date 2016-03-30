'use strict';
var argv  = require('optimist').argv;
var cp    = require('child_process');
var fs    = require('fs');

let appId = argv._[0];
if(!appId) {
    console.log('Please specify app name');
    process.exit(1);
}

try {
    fs.mkdirSync(`apps`);
} catch(e) {;}

let exists = true;
try {
    fs.accessSync(`apps/${appId}`, fs.R_OK);
} catch (e) {
    exists = false;
}

if(exists) {
    console.log(`App ${appId} is already installed.`);
    process.exit(1);
}

try {
    let res = cp.execSync(`git clone https://github.com/drdrsh/${appId}.git ./apps/${appId}`);
} catch(e) {
    console.log(`Failed to install app`);
    process.exit(1);
}

let src = `./apps/${appId}/settings/database-dist.js`;
let dst = `./apps/${appId}/settings/database.js`;
fs.createReadStream(src).pipe(fs.createWriteStream(dst));

process.exit(0);