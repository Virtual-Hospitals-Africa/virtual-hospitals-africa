#! /usr/bin/env bash
set -euo pipefail

me=$(whoami)

ensure_you_have() {
  if ! command -v "$1" &> /dev/null
  then
    echo "Please install ${2-$1}"
    exit 1
  fi
}

db_exists() {
  psql -lqt | cut -d \| -f 1 | grep -qw "$1"
}

echo "Checking you have the right tools installed..."

ensure_you_have "git"
ensure_you_have "deno"
ensure_you_have "heroku"
ensure_you_have "redis-server" "redis"
ensure_you_have "createdb" "postgresql"

echo "Great! You have the right tools installed. Creating a local database..."

db_exists vha_dev || createdb -h localhost -U "$me" -w vha_dev
db_exists vha_test || createdb -h localhost -U "$me" -w vha_test

echo "Done! Now we'll set up your local environment variables..."

if [ ! -f .env.local ] || [ ! -f .env.prod ]; then
  heroku whoami &> /dev/null || heroku login

  heroku_vars=$(mktemp)

  heroku config -a virtual-hospitals-africa >> "$heroku_vars"

  awk '/:/ {
    if ($1 !~ /^HEROKU/ && $1 != "SELF_URL:" && $1 != "PGSSLMODE:" && $1 != "REDISCLOUD_URL:") {
      print substr($1, 1, length($1) - 1) "=" $2
    }
  }' < "$heroku_vars" >> .env.local

  cp .env.local .env.prod

  awk '/:/ {
    if ($1 == "REDISCLOUD_URL:") {
      print substr($1, 1, length($1) - 1) "=" $2
    }
    if ($1 == "HEROKU_POSTGRESQL_MAUVE_URL:") {
      print "DATABASE_URL=" $2
    }
  }' < "$heroku_vars" >> .env.prod

  echo "DATABASE_URL=postgres://${me}@localhost:5432/vha_dev" >> .env.local

  echo "Great! You're environment variables are all set up."
else
  echo "It looks like you already have a .env.local and .env.prod files."
fi

redis-server --daemonize yes

deno task switch:local

echo "Now let's migrate your local database..."

deno task db:migrate latest
IS_TEST=true deno task db:migrate latest

echo "Migrations complete! You can now run the server with 'deno task start'"
