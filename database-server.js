'use strict';
var argv  = require('optimist').argv;
var cp    = require('child_process');
var targz = require('tar.gz');
var fs    = require('fs');



/*
if(!process.getuid || process.getuid() !== 0) {
    console.log("This script needs to run as root to be able to start a docker container");
    process.exit(1);
}
*/

try {
    fs.accessSync('./app.js', fs.R_OK);
} catch (e) {
    console.log("Please run this from the root path of the project");
    process.exit(1);
}

if(argv._.length !== 2) {
    console.log("Please specify either start or stop followed by app id");
    process.exit(1);
}

if(['start', 'stop'].indexOf(argv._[0]) === -1) {
    console.log("Please specify either start or stop followed by app id");
    process.exit(1);
}

let mode = argv._[0];
let appId = argv._[1];
let force = argv.force;

var dbConfig = null;
try {
    dbConfig = require(`./apps/${appId}/settings/database.js`);
} catch(e) {
    console.log('Failed to read database settings');
    process.exit(1);
}

let engineName = `${appId}-arango-server`;
let port = dbConfig.test.url.split(':').pop();

const DB_FILES_PATH = `./apps/${appId}/data/`;
const ARANGO_PATH = require('path').resolve(`${DB_FILES_PATH}arangodb/`);
let   dbExists     = true;
let   shouldDelete = true;
try {
    fs.accessSync(ARANGO_PATH + '/databases/', fs.R_OK);
} catch (e) {
    dbExists = false;
}

if(dbExists && !force && mode === 'start') {
    console.log("Database already exists, use --force to delete existant database");
    shouldDelete = false;
}

process.stdout.write("Stopping previous containers...");

try {

    cp.execSync(`docker stop ${engineName}`);

    cp.execSync(`docker rm ${engineName}`);

} catch (e) {;}

process.stdout.write("Done\n");

if(mode === 'stop') {
    process.exit(0);
}

if(shouldDelete) {
    require('rimraf').sync(ARANGO_PATH);
    process.stdout.write("Extracting data...");
    targz()
        .extract(`${DB_FILES_PATH}data.tar.gz`, ARANGO_PATH)
        .then(runContainer)
        .catch(function () {
            console.log(`Failed to extract ${DB_FILES_PATH}data.tar.gz`);
            process.exit(1);
        });
} else {
    runContainer()
}

function runContainer() {

    process.stdout.write("Done\n");
    process.stdout.write(`Starting ArangoDB docker container on port ${port} named ${engineName}....`);
    let newPath = ARANGO_PATH;
    newPath =
        newPath
            .replace(/([A-Za-z]):\\/ig, function(match, p1){return '/' + p1.toLowerCase() + '/' })
            .replace(/\\/ig,'/');


    let params = [
        '--name', engineName,
        '-p', `${port}:8529`,
        '-d',
        '-v', `${newPath}:/var/lib/arangodb`,
        `arangodb:2.8.1`
    ];

    let cmd = 'docker run ' + params.join(' ');
    cp.execSync(cmd);

    process.stdout.write("Done\n");
    process.exit(0);
}