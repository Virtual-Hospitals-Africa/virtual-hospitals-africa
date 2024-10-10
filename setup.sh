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

echo "Checking you have the right tools installed..."

ensure_you_have "git"
ensure_you_have "deno"
ensure_you_have "npm" "node"
ensure_you_have "heroku"
ensure_you_have "redis-server" "redis"
ensure_you_have "createdb" "postgresql"

if [ ! -f .env.local ] || [ ! -f .env.prod ]; then
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

  echo "DATABASE_URL=postgres://${me}@localhost:5432/vha_dev" >> .env.local

  echo "Great! Your environment variables are all set up."
else
  echo "It looks like you already have a .env.local and .env.prod files."
fi

redis-server --daemonize yes

echo "Now we'll install the project dependencies..."

deno task switch:local

echo "Now let's migrate your local database..."
deno task db:local reset

echo "Migrations complete! You can now run the server with 'deno task start'"
