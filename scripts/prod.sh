#! /usr/bin/env bash
set -eo pipefail

deno task switch:prod

if [[ "$1 $2" == "db:restore latest" ]]; then
  deno task heroku down
  heroku pg:reset --app virtual-hospitals-africa --confirm virtual-hospitals-africa
  deno task db:restore latest
  deno task heroku up
  exit 0
fi

deno task "$@"
