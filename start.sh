# /usr/bin/env bash

[ "$#" -eq 2 ] || die "2 argument required, $# provided"


pm2 stop $1
pm2 delete $1
sudo node database-server.js stop $1
sudo node database-server.js start $1
pm2 start app.js -f --name $1 -- --NODE_ENV=$2 --appId=$1

