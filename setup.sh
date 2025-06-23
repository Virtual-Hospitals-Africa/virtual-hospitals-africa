#! /usr/bin/env bash
set -euo pipefail

./scripts/setup/check_dependencies.sh
./scripts/setup/initialize_local_databases.sh
./scripts/setup/daemonize_redis.sh
./scripts/setup/copy_production_environment_variables.sh
