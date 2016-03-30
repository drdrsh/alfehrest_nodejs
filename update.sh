# /usr/bin/env bash

pm2 stop all
git pull
pm2 restart all

