#! /usr/bin/env bash
set -euo pipefail

if [ -f .env.local ]; then
  >&2 echo "CONFLIT: It looks like you already have a .env.local file"
  exit 1
fi

if [ -f .env.prod ]; then
  >&2 echo "CONFLIT: It looks like you already have a .env.prod file"
  exit 1
fi
 
heroku whoami &> /dev/null || heroku login

heroku_vars=$(mktemp)
heroku config -a virtual-hospitals-africa >> "$heroku_vars"

awk '/:/ {
  if ($1 !~ /^HEROKU/ && $1 != "SELF_URL:" && $1 != "PGSSLMODE:" && $1 != "REDISCLOUD_URL:" && $1 != "DATABASE_URL:" && $1 != "ON_PRODUCTION:") {
    print substr($1, 1, length($1) - 1) "=" $2
  }
}' < "$heroku_vars" >> .env.local

cp .env.local .env.prod

awk '/:/ {
  if ($1 == "REDISCLOUD_URL:") {
    print substr($1, 1, length($1) - 1) "=" $2
  }
  if ($1 == "DATABASE_URL:") {
    print "DATABASE_URL=" $2
  }
}' < "$heroku_vars" >> .env.prod

echo "Great! Your environment variables are all set up."
