# AlFehrest ArangoDB and NodeJS Server  [![Build Status](https://travis-ci.org/drdrsh/alfehrest_nodejs.svg?branch=master)](https://travis-ci.org/drdrsh/alfehrest_nodejs)
An [ArrangoDB](http://arangodb.com) and [NodeJS](http://nodejs.org) based AlFehrest server side app.


Before installing you need to have NodeJS and ArangoDB installed. 

If you don't want to install ArangoDB just fire up a Docker container 
```shell
docker run -d -e ARANGO_NO_AUTH=1 -p 8529:8529 arangodb:latest
```

Then

```shell
git clone https://github.com/drdrsh/alfehrest_nodejs.git .
npm install
```

Create your own ```./settings/database.js``` based on ```./settings/database-dist.js``` 

If this is too much hassle for you and you want a bare database just copy database.dist.js into database.js
```shell
cp ./settings/database.dist.js ./settings/database.js
```

and then run the following commands 
```shell
node install.js test
node install.js development
```

You should be done by now, to run the tests you need [mocha](http://mochajs.org)
```shell
npm install -g mocha
npm test
```

To start the server run
```shell
npm start
```

