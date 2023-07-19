#! /usr/bin/env bash
set -xeuo pipefail

me=`whoami`

sudo apt-get update
sudo apt-get -y install postgresql
sudo systemctl start postgresql
sudo createdb -h localhost -U $me -w vha_test
echo "DATABASE_URL=postgres://$me@localhost:5432/vha_test" > .env