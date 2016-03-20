#!/usr/bin/env bash

mkdir arangodb
cd arangodb
tar xvzf ../data.tar.gz
cd ..

ENGINE_NAME=alfehrest-arangodb-engine

sudo docker stop $ENGINE_NAME
sudo docker rm   $ENGINE_NAME
sudo docker run --name $ENGINE_NAME -p 8529:8529 -d -v $(pwd)/arangodb:/var/lib/arangodb arangodb:2.8.1