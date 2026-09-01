#! /usr/bin/env bash
set -euo pipefail

containers=$(ssh "ec2-user@$VHA_AWS_IP" -i ~/.ssh/vha.pem "docker ps --format '{{.Names}} {{.ID}}'")

events=$(echo "${containers}" | awk '/vha-events/ { print $2 }')
app=$(echo "${containers}" | awk '/vha-app/ { print $2 }')

ssh "ec2-user@$VHA_AWS_IP" -i ~/.ssh/vha.pem "docker logs $app" 1>prod_app_stdout.log 2>prod_app_stderr.log
ssh "ec2-user@$VHA_AWS_IP" -i ~/.ssh/vha.pem "docker logs $events" 1>prod_events_stdout.log 2>prod_events_stderr.log

echo "prod_app_stdout.log"