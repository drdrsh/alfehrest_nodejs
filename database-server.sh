#!/usr/bin/env bash
ENGINE_NAME=alfehrest-arangodb-engine


if ! type "docker" > /dev/null 2>&1; then
        echo "This script requires Docker, Please install Docker and try again"
        exit 1
fi

if [ "$(id -u)" != "0" ]; then
        echo "This script needs to run as root to be able to start a docker container" 1>&2
        exit 1
fi

if [ ! -f app.js ]; then
        # We are probably running outside the correct directory
        echo "Please run this from the root path of the project"
        exit 1
fi

if [[ $1 != "start" && $1 != "stop" ]]; then
        echo "Please specify the desired operation (either 'start' or 'stop')"
	exit 1
fi

echo -n "Stopping previous containers..."

sudo docker stop $ENGINE_NAME > /dev/null 2>&1
sudo docker rm   $ENGINE_NAME > /dev/null 2>&1

echo "Done"

if [[ $1 == "stop" ]]; then
        exit
fi

echo -n "Extracting data..."
cd data
rm arangodb -rf
mkdir arangodb
cd arangodb
tar xvzf ../data.tar.gz > /dev/null 2>&1
cd ../..

echo "Done"

echo -n "Starting ArangoDB docker container..."

sudo docker run --name $ENGINE_NAME -p 8529:8529 -d -v $(pwd)/data/arangodb:/var/lib/arangodb arangodb:2.8.1 > /dev/null 2>&1

echo "Done"
