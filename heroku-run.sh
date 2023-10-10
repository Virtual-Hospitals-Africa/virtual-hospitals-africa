#! /usr/bin/env bash
set -xeuo pipefail

ARTIFACT_NAME="$1"

if ! [ "$ARTIFACT_NAME" = "web" -o "$ARTIFACT_NAME" = "chatbot" -o "$ARTIFACT_NAME" = "token_refresher" ]; then
  echo "Must provide a recognized artifact name"
  exit 1
fi

if [ "$ARTIFACT_NAME" = "web" ]; then
  # TODO: see if we actually have migrations to run by comparing files, otherwise don't run this
  deno task db:migrate:web
fi

get_github() {
  curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_READ_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$1"
}

get_artifacts() {
  get_github https://api.github.com/repos/morehumaninternet/virtual-hospitals-africa/actions/artifacts
}

find_matching_artifact() {
  jq -r --arg artifact_name "$ARTIFACT_NAME" \
        --arg commit "$HEROKU_SLUG_COMMIT" \
    '.artifacts[] | select(.name == $artifact_name) | select(.workflow_run.head_sha == $commit) | .url'
}

ARTIFACT_URL=$(get_artifacts | find_matching_artifact)

if [ -z "$ARTIFACT_URL" ]; then
  echo "No matching artifact found, running $ARTIFACT_NAME from source"
  deno task $ARTIFACT_NAME
else
  echo "Found artifact for $ARTIFACT_NAME, downloading and running binary"
  mkdir -p binaries
  get_github $ARTIFACT_URL/zip > binaries/$ARTIFACT_NAME.zip
  unzip binaries/$ARTIFACT_NAME.zip -d binaries
  rm binaries/$ARTIFACT_NAME.zip
  ./binaries/$ARTIFACT_NAME
fi
