#!/usr/bin/env bash
ENGINE_NAME=alfehrest-arangodb-engine

if [ ! -f app.js ]; then
    # We are probably running outside the correct directory
    echo "Please run this from the root path of the project"
    exit 1
fi

cd data
mkdir arangodb
cd arangodb
tar xvzf ../data.tar.gz
cd ../..

sudo docker stop $ENGINE_NAME
sudo docker rm   $ENGINE_NAME
sudo docker run --name $ENGINE_NAME -p 8529:8529 -d -v $(pwd)/arangodb:/var/lib/arangodb arangodb:2.8.1
