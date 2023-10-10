#! /usr/bin/env bash
set -euo pipefail

ARTIFACT_NAME="$1"

if ! [ "$ARTIFACT_NAME" = "web" -o "$ARTIFACT_NAME" = "chatbot" -o "$ARTIFACT_NAME" = "token_refresher" ]; then
  echo "Must provide a recognized artifact name"
  exit 1
fi

if [ "$ARTIFACT_NAME" = "web" ]; then
  # TODO: see if we actually have migrations to run by comparing files, otherwise don't run this
  deno task db:migrate:latest
fi

deno task $ARTIFACT_NAME

# TODO: run from github artifacts if available
# get_github() {
#   curl -L \
#     -H "Accept: application/vnd.github+json" \
#     -H "Authorization: Bearer $GITHUB_READ_TOKEN" \
#     -H "X-GitHub-Api-Version: 2022-11-28" \
#     "$1"
# }

# get_artifacts() {
#   get_github https://api.github.com/repos/morehumaninternet/virtual-hospitals-africa/actions/artifacts
# }

# make_deno_script() {
#   printf "const archive_download_url = "
#   get_artifacts
#   echo ".artifacts.find(a => a.name == '$ARTIFACT_NAME' && a.workflow_run.head_sha == '$HEROKU_SLUG_COMMIT')?.archive_download_url;"
#   echo "if (archive_download_url) console.log(archive_download_url);"
# }

# SCRIPT=$(mktemp)
# make_deno_script > $SCRIPT
# ARTIFACT_URL=$(deno run $SCRIPT)

# if [ -z "$ARTIFACT_URL" ]; then
#   echo "No matching artifact found, running $ARTIFACT_NAME from source"
#   deno task $ARTIFACT_NAME
# else
#   echo "Found artifact for $ARTIFACT_NAME, downloading and running binary"
#   get_github $ARTIFACT_URL > $ARTIFACT_NAME.zip
#   unzip $ARTIFACT_NAME.zip
#   rm $ARTIFACT_NAME.zip
#   chmod +x $ARTIFACT_NAME
#   ./$ARTIFACT_NAME
# fi
