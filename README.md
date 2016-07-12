# AlFehrest ArangoDB and NodeJS Server  [![Build Status](https://travis-ci.org/drdrsh/alfehrest_nodejs.svg?branch=master)](https://travis-ci.org/drdrsh/alfehrest_nodejs)
An [ArangoDB](http://arangodb.com) and [NodeJS](http://nodejs.org) based AlFehrest server side app.


## Docker based build 

### With test data

```shell
git clone https://github.com/drdrsh/alfehrest_nodejs.git .
npm install
```

Then copy database.dist.js into database.js
```shell
cp ./settings/database.dist.js ./settings/database.js
```

Then fire up the docker arangodb container with the data by running the database-server script
```shell
sudo ./database-server.sh start 
```

You should be done by now, to run the tests you need [mocha](http://mochajs.org)
```shell
sudo npm install -g mocha
npm test
```

To start the server run
```shell
npm start
```

### Without test data

```shell
git clone https://github.com/drdrsh/alfehrest_nodejs.git .
npm install
cp ./settings/database.dist.js ./settings/database.js
sudo docker run -d -e ARANGO_NO_AUTH=1 -p 8529:8529 arangodb:latest
npm start
```

## Non-docker based build 

Before installing you need to have NodeJS and ArangoDB installed.

```shell
git clone https://github.com/drdrsh/alfehrest_nodejs.git .
npm install
```

Create your own ./settings/database.js based on ./settings/database-dist.js
then fire up the server

```shell
npm start
```
