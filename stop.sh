# /usr/bin/env bash

[ "$#" -eq 1 ] || die "1 argument required, $# provided"


pm2 stop $1
pm2 delete $1
sudo node database-server.js stop $1
