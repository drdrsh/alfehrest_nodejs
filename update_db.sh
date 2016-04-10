# /usr/bin/env bash


if [ ! "$#" -eq 2 ]; then
	echo "2 argument required, $# provided"
	exit 1
fi

DIR="apps/$1"
if [ ! -d "$DIR" ]; then
	echo "App $1 not found"
	exit 1
fi

cd $DIR
git pull || exit 1
cd ../..

pm2 stop $1
pm2 delete $1
sudo node database-server.js stop $1
sudo node database-server.js start $1 --force
pm2 start app.js -f --name $1 -- --NODE_ENV=$2 --appId=$1

